// dsh-relay-server：NAS 端中继服务（docs/protocol.md 的服务端实现）
//
// 职责：单一 TLS 端口上分流两类流量——
//   1. 手机流量：TLS 解密后的原始字节流 → 经 data 连接池透传给插件（纯字节搬运，零解析）
//   2. 插件通道：/__relay/ctl（控制 WS）+ /__relay/data（数据 WS 池），token 鉴权
//
// 多租户（协议 v2）：服务端持有客户端注册表 [{id, token, domain}]，每个客户端一条
// 独立 token、独立的控制连接与数据池。插件按 token 归属；手机流量按 Host 头路由到
// 对应客户端，Host 不匹配任何 domain 时落到无 domain 的默认客户端（裸 IP 兼容）。
//
// 所有状态都封装在 createRelayServer() 闭包内（支持同进程多实例，测试用）。

import tls from 'node:tls';
import http from 'node:http';
import crypto from 'node:crypto';
import net from 'node:net';
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { WebSocketServer, WebSocket } from 'ws';

const PKG_VERSION = (() => {
  try {
    return JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;
  } catch { return '0.0.0'; }
})();

// ---------- 配置（env 默认值；createRelayServer 可覆盖） ----------
const defaults = {
  port: Number(process.env.RELAY_PORT ?? 8443),
  host: process.env.RELAY_HOST ?? '0.0.0.0',
  clients: null, // 直接注入的注册表 [{id, token, domain?}]
  clientsFile: (process.env.RELAY_CLIENTS_FILE ?? '').trim(),
  token: (process.env.RELAY_TOKEN ?? '').trim(), // 向后兼容：单客户端部署
  tokenFile: (process.env.RELAY_TOKEN_FILE ?? '').trim(),
  adminPassword: (process.env.RELAY_ADMIN_PASSWORD ?? '').trim(), // WebUI 管理密码
  adminPasswordFile: (process.env.RELAY_ADMIN_PASSWORD_FILE ?? '').trim(),
  settingsFile: (process.env.RELAY_SETTINGS_FILE ?? '').trim(), // 管理台可改配置的持久化
  rotateDays: Number(process.env.RELAY_ROTATE_DAYS ?? 30),       // 密钥自动轮换周期（0=关）
  enrollCode: (process.env.RELAY_ENROLL_CODE ?? '').trim(),      // 非空 = 申请需邀请码
  tlsCert: (process.env.RELAY_TLS_CERT ?? '').trim(),
  tlsKey: (process.env.RELAY_TLS_KEY ?? '').trim(),
  poolHint: Number(process.env.RELAY_POOL_HINT ?? 8), // 建议插件维持的池大小（hello 里带给插件）
  bindWaitMs: Number(process.env.RELAY_BIND_WAIT_MS ?? 5000),
};

/** token 常量时间比较（长度不同直接否，长度本身不构成泄露）。 */
function tokenEqual(a, b) {
  const ba = Buffer.from(String(a ?? ''), 'utf8');
  const bb = Buffer.from(String(b ?? ''), 'utf8');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

/** 解析并校验客户端注册表。返回 [{id, token, domain}]（domain 归一为小写无端口）。 */
export function normalizeClients(raw) {
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('客户端注册表为空');
  const seenId = new Set();
  const seenToken = new Set();
  const seenDomain = new Set();
  return raw.map((c, i) => {
    const id = String(c?.id ?? '').trim();
    const token = String(c?.token ?? '').trim();
    const domain = String(c?.domain ?? '').trim().toLowerCase().replace(/:\d+$/, '');
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(id)) throw new Error(`clients[${i}].id 非法: "${id}"`);
    if (token.length < 16) throw new Error(`clients[${i}].token 太短（至少 16 字符）`);
    if (seenId.has(id)) throw new Error(`clients[${i}].id 重复: ${id}`);
    if (seenToken.has(token)) throw new Error(`clients[${i}].token 与其他客户端重复`);
    if (domain) {
      if (seenDomain.has(domain)) throw new Error(`clients[${i}].domain 重复: ${domain}`);
      seenDomain.add(domain);
    }
    seenId.add(id); seenToken.add(token);
    const out = { id, token, domain };
    if (Number.isFinite(c?.issuedAt)) out.issuedAt = c.issuedAt; // 密钥签发时间（自动轮换用）
    return out;
  });
}

/** 从配置装配注册表：clients > clientsFile > 单 token 兼容。 */
function loadClients(cfg) {
  if (Array.isArray(cfg.clients)) return normalizeClients(cfg.clients);
  if (cfg.clientsFile) {
    const raw = JSON.parse(readFileSync(cfg.clientsFile, 'utf8'));
    const list = raw.clients ?? raw;
    // 准入模式允许空注册表引导启动（等第一批客户端申请进来）
    if (Array.isArray(list) && list.length === 0) return [];
    return normalizeClients(list);
  }
  const token = cfg.token || (() => {
    try { return readFileSync(cfg.tokenFile, 'utf8').trim(); } catch { return ''; }
  })();
  if (!token) throw new Error('未配置任何客户端（RELAY_CLIENTS_FILE / RELAY_TOKEN）——拒绝明文裸奔启动');
  return normalizeClients([{ id: 'default', token }]);
}

export function createRelayServer(overrides = {}) {
  const cfg = { ...defaults, ...overrides };
  const registry = loadClients(cfg);

  // ---------- 运行状态 ----------
  /** @type {Map<string,{id,token,domain,issuedAt,startedAt,connIdSeq,ctl,phoneConns,idleData,clientIp,identity,graceTokens}>} */
  const sessions = new Map();
  for (const c of registry) {
    sessions.set(c.id, {
      ...c,
      issuedAt: c.issuedAt ?? Date.now(),
      startedAt: Date.now(),
      connIdSeq: 0,
      ctl: null,
      clientIp: '',
      identity: null, // 客户端上报的身份档案 {hostname,os,macs,ips,version}
      /** @type {Map<string,number>} 轮换宽限期的旧 token -> 过期时间 */
      graceTokens: new Map(),
      /** @type {Map<number,{ws:WebSocket, peer:net.Socket}>} 已绑定的手机流 */
      phoneConns: new Map(),
      /** @type {Set<WebSocket>} 空闲 data 连接 */
      idleData: new Set(),
    });
  }
  // registry 与 session 保持同一对象：轮换/改名即原地更新
  registry.length = 0;
  registry.push(...sessions.values());
  const state = {
    startedAt: Date.now(),
    httpPort: null, // 内部 http server（插件 WS upgrade）端口
    /** @type {Set<net.Socket>} 全部入站连接（close 时统一销毁，保证快速关停） */
    inbound: new Set(),
  };

  function log(...args) {
    console.log(new Date().toISOString(), ...args);
  }

  // 按域名找默认客户端（无 domain 的第一个；注册表保证最多提示一次歧义）
  const defaultSession = () => {
    for (const s of sessions.values()) if (!s.domain) return s;
    return null;
  };
  const resolveByHost = (host) => {
    const h = String(host ?? '').trim().toLowerCase().replace(/:\d+$/, '');
    if (!h) return defaultSession();
    for (const s of sessions.values()) if (s.domain && s.domain === h) return s;
    return defaultSession();
  };
  const resolveByToken = (t) => {
    const now = Date.now();
    for (const s of sessions.values()) {
      if (tokenEqual(t, s.token)) return { s, usedGrace: false };
      // 轮换宽限期内的旧 token 仍然可用（给插件时间无感换新）
      for (const [old, until] of [...s.graceTokens]) {
        if (until < now) { s.graceTokens.delete(old); continue; }
        if (tokenEqual(t, old)) return { s, usedGrace: true };
      }
    }
    return null;
  };

  function clientStats(s) {
    return { id: s.id, connected: !!s.ctl, phone: s.phoneConns.size, idle: s.idleData.size };
  }
  function stats() {
    let phone = 0; let idle = 0;
    const clients = [];
    for (const s of sessions.values()) {
      const cs = clientStats(s);
      phone += cs.phone; idle += cs.idle;
      clients.push(cs);
    }
    return { phone, idle, uptime: Math.floor((Date.now() - state.startedAt) / 1000), clients };
  }
  function ctlSend(s, obj) {
    try { s.ctl?.send(JSON.stringify(obj)); } catch { /* 连接正断 */ }
  }

  // ---------- 管理面（WebUI + API，路径 /__relay/admin/*） ----------
  // 管理密码：env > 文件 > 自动生成落盘（日志打印一次）。与插件 token、手机 PIN 完全独立。
  let adminPassword = cfg.adminPassword;
  if (!adminPassword && cfg.adminPasswordFile) {
    try { adminPassword = readFileSync(cfg.adminPasswordFile, 'utf8').trim(); } catch { adminPassword = ''; }
    if (!adminPassword) {
      adminPassword = crypto.randomBytes(12).toString('base64url');
      try {
        writeFileSync(cfg.adminPasswordFile, `${adminPassword}\n`, { mode: 0o600 });
        log(`admin password generated -> ${cfg.adminPasswordFile}: ${adminPassword}`);
      } catch {
        log(`admin password (ephemeral! 无法写入 ${cfg.adminPasswordFile}): ${adminPassword}`);
      }
    }
  }
  if (!adminPassword) {
    adminPassword = crypto.randomBytes(12).toString('base64url');
    log(`admin password (ephemeral! 未配置 RELAY_ADMIN_PASSWORD[_FILE]): ${adminPassword}`);
  }
  let adminCookieValue = crypto.createHash('sha256').update(`dsh-relay-admin|${adminPassword}`).digest('hex');
  // 只有注册表来自文件时才允许页面增删（回写才有落点）
  const adminMutable = !!cfg.clientsFile;

  // ---------- 管理台可改配置（env 为默认，settings.json 可覆盖） ----------
  let settings = {
    enrollCode: cfg.enrollCode || '',
    rotateDays: Number.isFinite(cfg.rotateDays) && cfg.rotateDays >= 0 ? cfg.rotateDays : 30,
    poolHint: cfg.poolHint,
    bindWaitMs: cfg.bindWaitMs,
  };
  let settingsMutable = !!cfg.settingsFile;
  if (cfg.settingsFile) {
    try {
      const saved = JSON.parse(readFileSync(cfg.settingsFile, 'utf8'));
      if ('enrollCode' in saved) settings.enrollCode = String(saved.enrollCode ?? '');
      if (Number.isFinite(saved.rotateDays)) settings.rotateDays = Math.max(0, saved.rotateDays);
      if (Number.isFinite(saved.poolHint) && saved.poolHint >= 1 && saved.poolHint <= 64) settings.poolHint = saved.poolHint;
      if (Number.isFinite(saved.bindWaitMs) && saved.bindWaitMs >= 500 && saved.bindWaitMs <= 60_000) settings.bindWaitMs = saved.bindWaitMs;
    } catch { /* 首次没有文件 */ }
  }
  function persistSettings() {
    if (!cfg.settingsFile) throw new Error('配置不可持久化（未配置 RELAY_SETTINGS_FILE）');
    writeFileSync(`${cfg.settingsFile}.tmp`, `${JSON.stringify(settings, null, 2)}\n`, { mode: 0o600 });
    renameSync(`${cfg.settingsFile}.tmp`, cfg.settingsFile);
  }

  // ---------- 事件日志（内存环形，最多 200 条） ----------
  const events = [];
  function pushEvent(type, text) {
    events.push({ ts: Date.now(), type, text });
    if (events.length > 200) events.splice(0, events.length - 200);
  }

  // ---------- 密钥轮换（手动 + 自动；旧 token 宽限 10 分钟） ----------
  function rotateClient(s, reason) {
    const old = s.token;
    const token = crypto.randomBytes(24).toString('hex');
    s.token = token;
    s.issuedAt = Date.now();
    if (!tokenEqual(old, token)) s.graceTokens.set(old, Date.now() + 10 * 60_000);
    // 通过已认证的控制通道无感推送新密钥；推送丢失也没关系——旧 token 在宽限期内仍可用，
    // 自动轮换的下个周期会再次触发（age 仍超阈值），自愈。
    ctlSend(s, { type: 'rotate', token });
    pushEvent('rotate', `客户端 ${s.id} 密钥已轮换（${reason}）`);
    log(`token rotated for client ${s.id} (${reason})`);
    return token;
  }
  const rotateTimer = setInterval(() => {
    if (!(settings.rotateDays > 0)) return;
    const now = Date.now();
    for (const s of sessions.values()) {
      if (s.issuedAt && now - s.issuedAt > settings.rotateDays * 86_400_000) rotateClient(s, `${settings.rotateDays} 天自动轮换`);
    }
  }, 3600_000);
  rotateTimer.unref?.();

  // ---------- 准入申请（enrollment） ----------
  // 流程：插件 POST /__relay/enroll（带身份档案）→ 管理台提示 → 批准后密钥经 poll 下发。
  // 待审批只存内存（重启即失），插件 poll 到 expired 会自动重新申请——无状态孤儿。
  const ENROLL_EXPIRE_MS = 10 * 60_000;
  const ENROLL_PENDING_CAP = 8;
  /** @type {Map<string,{id,info,sourceIp,createdAt,status:'pending'|'approved'|'denied',result?:{clientId,token}}>} */
  const enrollPending = new Map();
  const enrollHits = new Map(); // 每 IP 频率限制
  function enrollRateOk(ip, max) {
    const now = Date.now();
    let rec = enrollHits.get(ip);
    if (!rec || now - rec.windowStart > 60_000) rec = { count: 0, windowStart: now };
    rec.count += 1;
    enrollHits.set(ip, rec);
    if (enrollHits.size > 2000) {
      for (const [k, v] of enrollHits) if (now - v.windowStart > 120_000) enrollHits.delete(k);
    }
    return rec.count <= max;
  }
  function sanitizeIdentity(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const str = (v, n) => String(v ?? '').slice(0, n);
    const arr = (v, n, m) => Array.isArray(v) ? v.slice(0, m).map((x) => str(x, n)).filter(Boolean) : [];
    return {
      hostname: str(raw.hostname, 64),
      os: str(raw.os, 64),
      macs: arr(raw.macs, 32, 8),
      ips: arr(raw.ips, 64, 8),
      version: str(raw.version, 32),
    };
  }
  function enrollPendingList() {
    const now = Date.now();
    const out = [];
    for (const [id, r] of [...enrollPending]) {
      if (r.status === 'pending' && now - r.createdAt > ENROLL_EXPIRE_MS) {
        enrollPending.delete(id);
        pushEvent('enroll', `申请 ${id.slice(0, 8)} 过期（${r.info?.hostname || '未知设备'}）`);
        continue;
      }
      if (r.status === 'pending') {
        out.push({ id, createdAt: r.createdAt, sourceIp: r.sourceIp, info: r.info });
      }
    }
    return out;
  }

  /** 关闭某客户端的全部连接（页面删除客户端时调用）。 */
  function closeSession(s) {
    try { s.ctl?.close(1001, 'client removed'); } catch { /* 忽略 */ }
    for (const conn of [...s.phoneConns.values()]) {
      try { conn.ws.close(1001, 'client removed'); } catch { /* 忽略 */ }
      try { conn.peer.destroy(); } catch { /* 忽略 */ }
    }
    for (const ws of [...s.idleData]) { try { ws.close(1001, 'client removed'); } catch { /* 忽略 */ } }
    s.idleData.clear();
    s.phoneConns.clear();
    s.ctl = null;
  }

  /** 运行时应用新注册表：新增/更新/删除客户端，返回被删除的 id 列表（日志用）。 */
  function applyRegistry(nextRaw) {
    const next = normalizeClients(nextRaw);
    const nextIds = new Set(next.map((c) => c.id));
    for (const [id, s] of [...sessions]) {
      if (!nextIds.has(id)) { closeSession(s); sessions.delete(id); }
    }
    const rebuilt = [];
    for (const c of next) {
      const cur = sessions.get(c.id);
      if (cur) {
        cur.token = c.token;
        cur.domain = c.domain;
        if (Number.isFinite(c.issuedAt)) cur.issuedAt = c.issuedAt;
      } else {
        sessions.set(c.id, {
          ...c,
          issuedAt: c.issuedAt ?? Date.now(),
          startedAt: Date.now(),
          connIdSeq: 0,
          ctl: null,
          clientIp: '',
          identity: null,
          graceTokens: new Map(),
          phoneConns: new Map(),
          idleData: new Set(),
        });
      }
      rebuilt.push(sessions.get(c.id));
    }
    registry.length = 0;
    registry.push(...rebuilt);
  }

  /** 注册表原子回写（tmp + rename）。仅在 clientsFile 模式下可用。 */
  function persistClients() {
    if (!cfg.clientsFile) throw new Error('注册表不可持久化（未配置 RELAY_CLIENTS_FILE）');
    const body = JSON.stringify({
      clients: registry.map((c) => ({
        id: c.id, token: c.token, issuedAt: c.issuedAt,
        ...(c.domain ? { domain: c.domain } : {}),
      })),
    }, null, 2);
    writeFileSync(`${cfg.clientsFile}.tmp`, `${body}\n`, { mode: 0o600 });
    renameSync(`${cfg.clientsFile}.tmp`, cfg.clientsFile);
  }

  // 登录失败限速（与插件 token 限速独立）
  const adminFails = new Map();
  function adminLockCheck(ip) {
    const now = Date.now();
    const rec = adminFails.get(ip);
    if (rec?.lockedUntil > now) return { locked: true, retryAfter: Math.ceil((rec.lockedUntil - now) / 1000) };
    return { locked: false, retryAfter: 0 };
  }
  function recordAdminFail(ip) {
    const now = Date.now();
    let rec = adminFails.get(ip);
    if (!rec || now - rec.windowStart > 60_000) rec = { count: 0, windowStart: now, lockedUntil: 0 };
    rec.count += 1;
    if (rec.count >= 5) rec.lockedUntil = now + 300_000; // 管理面锁更狠：5 分钟
    adminFails.set(ip, rec);
    if (adminFails.size > 1000) {
      for (const [k, v] of adminFails) if (now - v.windowStart > 600_000) adminFails.delete(k);
    }
  }

  const ADMIN_HTML = readFileSync(new URL('./admin.html', import.meta.url), 'utf8');

  function adminAuthed(req) {
    const m = /(?:^|;\s*)dsh_relay_admin=([A-Za-z0-9]+)/.exec(String(req.headers.cookie ?? ''));
    return !!m && tokenEqual(m[1], adminCookieValue);
  }
  function readBody(req, max = 64 * 1024) {
    return new Promise((resolve, reject) => {
      let size = 0;
      const chunks = [];
      req.on('data', (d) => {
        size += d.length;
        if (size > max) { reject(new Error('body too large')); req.destroy(); return; }
        chunks.push(d);
      });
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });
  }
  function json(res, code, obj, headers = {}) {
    const body = JSON.stringify(obj);
    res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(body), ...headers });
    res.end(body);
  }
  function parseJsonSafe(text) {
    try { return JSON.parse(text || '{}'); } catch { return null; }
  }
  function cloneRegistry() {
    return registry.map((c) => ({ id: c.id, token: c.token, domain: c.domain, issuedAt: c.issuedAt }));
  }

  async function adminRequest(req, res) {
    const url = new URL(req.url ?? '/', 'http://x');
    const p = url.pathname;
    if (p === '/__relay/admin' || p === '/__relay/admin/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(ADMIN_HTML);
      return;
    }

    // ---------- 准入申请（公开端点，无需登录；严格限速 + 可选邀请码） ----------
    if (p === '/__relay/enroll' && req.method === 'POST') {
      const ip = req.socket.remoteAddress ?? 'unknown';
      if (!enrollRateOk(`e:${ip}`, 10)) { json(res, 429, { ok: false, error: 'rate-limited' }); return; }
      const body = parseJsonSafe(await readBody(req));
      const info = sanitizeIdentity(body?.info);
      if (!info || !info.hostname) { json(res, 400, { ok: false, error: 'bad-identity' }); return; }
      if (settings.enrollCode && !tokenEqual(String(body?.code ?? ''), settings.enrollCode)) {
        pushEvent('enroll', `申请被拒：邀请码错误（${ip}）`);
        json(res, 403, { ok: false, error: 'bad-code' });
        return;
      }
      if (enrollPendingList().length >= ENROLL_PENDING_CAP) { json(res, 429, { ok: false, error: 'pending-full' }); return; }
      const id = crypto.randomBytes(12).toString('hex');
      enrollPending.set(id, { id, info, sourceIp: ip, createdAt: Date.now(), status: 'pending' });
      pushEvent('enroll', `新接入申请：${info.hostname}（${info.os || '?'} · 来自 ${ip}）`);
      log(`enroll request from ${ip} (${info.hostname})`);
      json(res, 200, { ok: true, requestId: id });
      return;
    }
    if (p === '/__relay/enroll/poll' && req.method === 'POST') {
      const ip = req.socket.remoteAddress ?? 'unknown';
      if (!enrollRateOk(`p:${ip}`, 60)) { json(res, 429, { ok: false, error: 'rate-limited' }); return; }
      const body = parseJsonSafe(await readBody(req));
      const r = enrollPending.get(String(body?.requestId ?? ''));
      if (!r || (r.status === 'pending' && Date.now() - r.createdAt > ENROLL_EXPIRE_MS)) {
        enrollPending.delete(String(body?.requestId ?? ''));
        json(res, 200, { ok: true, status: 'expired' });
        return;
      }
      if (r.status === 'pending') { json(res, 200, { ok: true, status: 'pending' }); return; }
      enrollPending.delete(r.id);
      if (r.status === 'approved') json(res, 200, { ok: true, status: 'approved', clientId: r.result.clientId, token: r.result.token });
      else json(res, 200, { ok: true, status: 'denied' });
      return;
    }

    if (!p.startsWith('/__relay/admin/api/')) { json(res, 404, { ok: false, error: 'not-found' }); return; }

    if (p === '/__relay/admin/api/login' && req.method === 'POST') {
      const ip = req.socket.remoteAddress ?? 'unknown';
      const lock = adminLockCheck(ip);
      if (lock.locked) { json(res, 429, { ok: false, error: 'locked', retryAfter: lock.retryAfter }); return; }
      const body = parseJsonSafe(await readBody(req));
      if (!body || !tokenEqual(String(body.password ?? ''), adminPassword)) {
        recordAdminFail(ip);
        log(`admin auth failed from ${ip}`);
        json(res, 401, { ok: false, error: 'wrong-password' });
        return;
      }
      adminFails.delete(ip);
      json(res, 200, { ok: true }, {
        'set-cookie': `dsh_relay_admin=${adminCookieValue}; Path=/__relay/admin; HttpOnly; SameSite=Strict; Max-Age=604800`,
      });
      return;
    }
    if (p === '/__relay/admin/api/logout' && req.method === 'POST') {
      json(res, 200, { ok: true }, { 'set-cookie': 'dsh_relay_admin=; Path=/__relay/admin; HttpOnly; SameSite=Strict; Max-Age=0' });
      return;
    }

    if (!adminAuthed(req)) { json(res, 401, { ok: false, error: 'unauthorized' }); return; }

    if (p === '/__relay/admin/api/overview' && req.method === 'GET') {
      json(res, 200, {
        ok: true,
        server: `dsh-relay-server/${PKG_VERSION}`,
        insecure: !buildTlsOptions(),
        mutable: adminMutable,
        settingsMutable,
        uptime: Math.floor((Date.now() - state.startedAt) / 1000),
        settings: { ...settings, enrollCodeSet: !!settings.enrollCode },
        pendingCount: enrollPendingList().length,
        clients: registry.map((c) => {
          const s = sessions.get(c.id);
          return {
            id: c.id,
            domain: c.domain,
            connected: !!s?.ctl,
            phone: s?.phoneConns.size ?? 0,
            idle: s?.idleData.size ?? 0,
            tokenHint: `${c.token.slice(0, 6)}…`,
            issuedAt: c.issuedAt,
            rotateDays: settings.rotateDays,
            clientIp: s?.clientIp ?? '',
            startedAt: s?.startedAt,
            identity: s?.identity ?? null,
          };
        }),
      });
      return;
    }
    if (p === '/__relay/admin/api/events' && req.method === 'GET') {
      json(res, 200, { ok: true, events: events.slice(-100).reverse() });
      return;
    }
    if (p === '/__relay/admin/api/enroll/list' && req.method === 'GET') {
      json(res, 200, { ok: true, pending: enrollPendingList() });
      return;
    }
    if (p === '/__relay/admin/api/enroll/approve' && req.method === 'POST') {
      if (!adminMutable) { json(res, 400, { ok: false, error: 'not-mutable', message: '需以 RELAY_CLIENTS_FILE 方式启动才能批准接入' }); return; }
      const body = parseJsonSafe(await readBody(req));
      const r = enrollPending.get(String(body?.requestId ?? ''));
      if (!r || r.status !== 'pending') { json(res, 404, { ok: false, error: 'no-such-request' }); return; }
      // 客户端 id：管理员指定 > 主机名 slug > client-N；冲突自动加后缀
      let id = String(body?.clientId ?? '').trim().toLowerCase();
      if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(id)) {
        id = String(r.info?.hostname ?? '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32);
      }
      if (!id) id = 'client';
      let unique = id;
      for (let i = 2; sessions.has(unique); i++) unique = `${id}-${i}`.slice(0, 64);
      const token = crypto.randomBytes(24).toString('hex');
      const domain = String(body?.domain ?? '').trim();
      const prev = cloneRegistry();
      try {
        applyRegistry([...prev, { id: unique, token, domain }]);
        persistClients();
      } catch (e) {
        applyRegistry(prev);
        try { persistClients(); } catch { /* 同上 */ }
        json(res, 400, { ok: false, error: 'invalid', message: e.message });
        return;
      }
      r.status = 'approved';
      r.result = { clientId: unique, token };
      sessions.get(unique).identity = r.info; // 申请时的身份档案直接入档
      pushEvent('enroll', `已批准接入：${r.info?.hostname || unique} → 客户端「${unique}」`);
      log(`enroll approved: ${unique} (${r.info?.hostname})`);
      json(res, 200, { ok: true, clientId: unique });
      return;
    }
    if (p === '/__relay/admin/api/enroll/deny' && req.method === 'POST') {
      const body = parseJsonSafe(await readBody(req));
      const r = enrollPending.get(String(body?.requestId ?? ''));
      if (!r || r.status !== 'pending') { json(res, 404, { ok: false, error: 'no-such-request' }); return; }
      r.status = 'denied';
      pushEvent('enroll', `已拒绝接入：${r.info?.hostname || r.sourceIp}`);
      log(`enroll denied: ${r.info?.hostname}`);
      json(res, 200, { ok: true });
      return;
    }
    if (p === '/__relay/admin/api/clients/rotate' && req.method === 'POST') {
      const body = parseJsonSafe(await readBody(req));
      const s = sessions.get(String(body?.id ?? ''));
      if (!s) { json(res, 404, { ok: false, error: 'no-such-client' }); return; }
      if (!cfg.clientsFile) { json(res, 400, { ok: false, error: 'not-mutable' }); return; }
      try { persistClients(); } catch (e) { json(res, 500, { ok: false, error: 'persist-failed', message: e.message }); return; }
      rotateClient(s, '管理员手动轮换');
      json(res, 200, { ok: true });
      return;
    }
    if (p === '/__relay/admin/api/settings' && req.method === 'POST') {
      const body = parseJsonSafe(await readBody(req));
      if (!body) { json(res, 400, { ok: false, error: 'bad-json' }); return; }
      if ('enrollCode' in body) settings.enrollCode = String(body.enrollCode ?? '').trim();
      if ('rotateDays' in body) {
        const v = Number(body.rotateDays);
        if (!Number.isFinite(v) || v < 0 || v > 3650) { json(res, 400, { ok: false, error: 'bad-rotate-days' }); return; }
        settings.rotateDays = Math.floor(v);
      }
      if ('poolHint' in body) {
        const v = Number(body.poolHint);
        if (!Number.isFinite(v) || v < 1 || v > 64) { json(res, 400, { ok: false, error: 'bad-pool-hint' }); return; }
        settings.poolHint = Math.floor(v);
      }
      if ('bindWaitMs' in body) {
        const v = Number(body.bindWaitMs);
        if (!Number.isFinite(v) || v < 500 || v > 60_000) { json(res, 400, { ok: false, error: 'bad-bind-wait' }); return; }
        settings.bindWaitMs = Math.floor(v);
      }
      if (settingsMutable) {
        try { persistSettings(); } catch (e) { json(res, 500, { ok: false, error: 'persist-failed', message: e.message }); return; }
      }
      pushEvent('settings', `管理台更新了配置（轮换=${settings.rotateDays}天，邀请码=${settings.enrollCode ? '开' : '关'}）`);
      json(res, 200, { ok: true, settings: { ...settings, enrollCodeSet: !!settings.enrollCode }, persisted: settingsMutable });
      return;
    }
    if (p === '/__relay/admin/api/password' && req.method === 'POST') {
      const body = parseJsonSafe(await readBody(req));
      if (!body || !tokenEqual(String(body.current ?? ''), adminPassword)) { json(res, 401, { ok: false, error: 'wrong-password' }); return; }
      const next = String(body.next ?? '');
      if (next.length < 8) { json(res, 400, { ok: false, error: 'too-short', message: '新密码至少 8 位' }); return; }
      adminPassword = next;
      adminCookieValue = crypto.createHash('sha256').update(`dsh-relay-admin|${adminPassword}`).digest('hex');
      let persisted = false;
      if (cfg.adminPasswordFile) {
        try { writeFileSync(cfg.adminPasswordFile, `${adminPassword}\n`, { mode: 0o600 }); persisted = true; } catch { /* 只读盘 */ }
      }
      pushEvent('settings', '管理员密码已修改');
      json(res, 200, { ok: true, persisted });
      return;
    }
    if (p === '/__relay/admin/api/clients/add' && req.method === 'POST') {
      if (!adminMutable) { json(res, 400, { ok: false, error: 'not-mutable', message: '需以 RELAY_CLIENTS_FILE 方式启动才能在页面增删客户端' }); return; }
      const body = parseJsonSafe(await readBody(req));
      if (!body) { json(res, 400, { ok: false, error: 'bad-json' }); return; }
      const id = String(body.id ?? '').trim();
      const domain = String(body.domain ?? '').trim();
      const token = crypto.randomBytes(24).toString('hex');
      const prev = cloneRegistry();
      try {
        applyRegistry([...prev, { id, token, domain }]);
        persistClients();
      } catch (e) {
        applyRegistry(prev);
        try { persistClients(); } catch { /* 回写失败保持旧盘上内容即可 */ }
        json(res, 400, { ok: false, error: 'invalid', message: e.message });
        return;
      }
      log(`admin: client "${id}" added (domain=${domain || '(default 裸IP)'})`);
      pushEvent('clients', `管理员创建客户端「${id}」${domain ? `（域名 ${domain}）` : '（默认·裸IP）'}`);
      json(res, 200, { ok: true, token }); // token 只在这里完整返回一次
      return;
    }
    if (p === '/__relay/admin/api/clients/domain' && req.method === 'POST') {
      if (!adminMutable) { json(res, 400, { ok: false, error: 'not-mutable', message: '需以 RELAY_CLIENTS_FILE 方式启动才能修改域名' }); return; }
      const body = parseJsonSafe(await readBody(req));
      const s = sessions.get(String(body?.id ?? ''));
      if (!s) { json(res, 404, { ok: false, error: 'no-such-client' }); return; }
      const domain = String(body?.domain ?? '').trim().toLowerCase().replace(/:\d+$/, '');
      const prev = cloneRegistry();
      try {
        applyRegistry(prev.map((c) => (c.id === s.id ? { ...c, domain } : c)));
        persistClients();
      } catch (e) {
        applyRegistry(prev);
        json(res, 400, { ok: false, error: 'invalid', message: e.message });
        return;
      }
      pushEvent('clients', `客户端「${s.id}」域名改为 ${domain || '（默认·裸IP）'}`);
      json(res, 200, { ok: true });
      return;
    }
    if (p === '/__relay/admin/api/clients/remove' && req.method === 'POST') {
      if (!adminMutable) { json(res, 400, { ok: false, error: 'not-mutable', message: '需以 RELAY_CLIENTS_FILE 方式启动才能在页面增删客户端' }); return; }
      const body = parseJsonSafe(await readBody(req));
      const id = String(body?.id ?? '');
      if (registry.length <= 1) { json(res, 400, { ok: false, error: 'last-client', message: '至少保留一个客户端' }); return; }
      if (!sessions.has(id)) { json(res, 404, { ok: false, error: 'no-such-client' }); return; }
      const prev = cloneRegistry();
      try {
        applyRegistry(prev.filter((c) => c.id !== id));
        persistClients();
      } catch (e) {
        applyRegistry(prev);
        json(res, 500, { ok: false, error: 'persist-failed', message: e.message });
        return;
      }
      log(`admin: client "${id}" removed`);
      pushEvent('clients', `管理员删除客户端「${id}」`);
      json(res, 200, { ok: true });
      return;
    }
    json(res, 404, { ok: false, error: 'not-found' });
  }

  // ---------- token 失败限速（按来源 IP） ----------
  const tokenFails = new Map();
  function failLockCheck(ip) {
    const now = Date.now();
    const rec = tokenFails.get(ip);
    if (rec?.lockedUntil > now) return { locked: true, retryAfter: Math.ceil((rec.lockedUntil - now) / 1000) };
    return { locked: false, retryAfter: 0 };
  }
  function recordTokenFail(ip) {
    const now = Date.now();
    let rec = tokenFails.get(ip);
    if (!rec || now - rec.windowStart > 60_000) rec = { count: 0, windowStart: now, lockedUntil: 0 };
    rec.count += 1;
    if (rec.count >= 5) rec.lockedUntil = now + 60_000;
    tokenFails.set(ip, rec);
    if (tokenFails.size > 5000) {
      for (const [k, v] of tokenFails) if (now - v.windowStart > 120_000) tokenFails.delete(k);
    }
  }

  // ---------- 插件通道（WS） ----------
  const wss = new WebSocketServer({ noServer: true });

  function onControl(s, ws, ip, usedGrace = false) {
    log(`plugin control connected (client=${s.id})`);
    s.clientIp = ip;
    pushEvent('connect', `客户端 ${s.id} 已连接（${ip}）`);
    if (s.ctl && s.ctl.readyState === WebSocket.OPEN) {
      try { s.ctl.close(4000, 'replaced'); } catch { /* 忽略 */ }
    }
    s.ctl = ws;
    ws.send(JSON.stringify({ type: 'hello', server: `dsh-relay-server/${PKG_VERSION}`, protocol: 1, client: s.id, pool: settings.poolHint }));
    // 客户端还在用旧 token（轮换推送丢了）：立刻补发新密钥，形成闭环
    if (usedGrace) ctlSend(s, { type: 'rotate', token: s.token });
    ctlSend(s, { type: 'stats', ...clientStats(s) });

    ws.on('message', (raw, isBinary) => {
      if (isBinary) return;
      let msg;
      try { msg = JSON.parse(String(raw)); } catch { return; }
      if (msg?.type === 'ping') ws.send(JSON.stringify({ type: 'pong', t: msg.t ?? 0 }));
      else if (msg?.type === 'info') s.identity = sanitizeIdentity(msg.info) ?? s.identity;
    });
    const drop = () => {
      if (s.ctl === ws) s.ctl = null;
      log(`plugin control lost (client=${s.id})`);
      pushEvent('disconnect', `客户端 ${s.id} 连接断开`);
      // 控制连接没了：该客户端已绑定手机流的对端已死，全部关闭（浏览器会自动重试）
      for (const conn of [...s.phoneConns.values()]) {
        try { conn.ws.close(1001, 'plugin offline'); } catch { /* 忽略 */ }
        try { conn.peer.destroy(); } catch { /* 忽略 */ }
      }
      for (const ws2 of [...s.idleData]) { try { ws2.close(1001, 'plugin offline'); } catch { /* 忽略 */ } }
      s.idleData.clear();
    };
    // once 守卫：close/error 对同一连接各触发一次，drop 只能执行一次
    let ctlDropped = false;
    const dropOnce = () => { if (ctlDropped) return; ctlDropped = true; drop(); };
    ws.on('close', dropOnce);
    ws.on('error', dropOnce);
  }

  function onDataSocket(s, ws) {
    s.idleData.add(ws);
    ws.on('close', () => s.idleData.delete(ws));
    ws.on('error', () => { try { ws.close(); } catch { /* 忽略 */ } });
  }

  function handleUpgrade(req, socket, head) {
    const url = (req.url ?? '').split('?')[0];
    const ip = socket.remoteAddress ?? 'unknown';

    const lock = failLockCheck(ip);
    if (lock.locked) {
      socket.write(`HTTP/1.1 429 Too Many Requests\r\nRetry-After: ${lock.retryAfter}\r\nConnection: close\r\n\r\n`);
      socket.destroy();
      return;
    }
    const resolved = resolveByToken(req.headers['x-relay-token']);
    if (!resolved) {
      recordTokenFail(ip);
      log(`auth failed from ${ip} (${url})`);
      socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }
    const { s, usedGrace } = resolved;

    if (url === '/__relay/ctl') {
      wss.handleUpgrade(req, socket, head, (ws) => onControl(s, ws, ip, usedGrace));
    } else if (url === '/__relay/data') {
      wss.handleUpgrade(req, socket, head, (ws) => onDataSocket(s, ws));
    } else {
      socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
      socket.destroy();
    }
  }

  // 内部 http server：插件 WS upgrade + 管理 WebUI/API（嗅探后的连接经本地桥接进来）
  const internal = http.createServer((req, res) => {
    adminRequest(req, res).catch(() => {
      try { json(res, 500, { ok: false, error: 'internal' }); } catch { /* 已响应 */ }
    });
  });
  internal.on('upgrade', handleUpgrade);

  // 数据面统计推送（每客户端推自己的）
  const statsTimer = setInterval(() => {
    for (const s of sessions.values()) ctlSend(s, { type: 'stats', ...clientStats(s) });
  }, 10_000);
  statsTimer.unref?.();

  // ---------- 数据面 ----------
  async function bindDataConn(s) {
    const take = () => {
      const ws = s.idleData.values().next().value;
      if (!ws) return null;
      s.idleData.delete(ws);
      return ws;
    };
    let ws = take();
    if (ws) return ws;
    const deadline = Date.now() + cfg.bindWaitMs;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 50));
      ws = take();
      if (ws) return ws;
    }
    return null;
  }

  // 短响应（status/503/421）：写完即收尾。必须兜住 error——
  // 客户端 abrupt close（RST）会让 end 后的 socket 冒出无监听的 ECONNRESET，直接打崩进程
  function replyRaw(socket, text) {
    socket.on('error', () => { try { socket.destroy(); } catch { /* 忽略 */ } });
    socket.end(text, () => { try { socket.destroy(); } catch { /* 忽略 */ } });
  }

  /** 手机流量入口：原始字节流整体透传（head 为嗅探期间缓存的首包）。 */
  async function pipePhoneSocket(socket, head, s) {
    // 嗅探结束到绑定完成之间存在无监听窗口，先兜住 error 防进程崩溃
    socket.on('error', () => { try { socket.destroy(); } catch { /* 忽略 */ } });
    const connId = ++s.connIdSeq;
    const ws = await bindDataConn(s);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      replyRaw(socket, 'HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\nNo tunnel available\r\n');
      return;
    }
    s.phoneConns.set(connId, { ws, peer: socket });
    ws.send(JSON.stringify({ bind: connId }));
    if (head?.length) ws.send(head);

    ws.on('message', (raw, isBinary) => {
      if (!isBinary) return; // 绑定后不应再有文本帧；忽略防注入
      if (!socket.destroyed) socket.write(raw);
    });
    // 手机 → 插件方向
    const onPhoneData = (chunk) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(chunk);
    };
    socket.on('data', onPhoneData);
    const teardown = () => {
      s.phoneConns.delete(connId);
      socket.off('data', onPhoneData);
      try { ws.close(); } catch { /* 忽略 */ }
      try { socket.destroy(); } catch { /* 忽略 */ }
    };
    ws.on('close', teardown);
    ws.on('error', teardown);
    socket.on('end', () => { try { ws.close(); } catch { /* 忽略 */ } });
    socket.on('error', teardown);
    socket.on('close', teardown);
  }

  // ---------- 嗅探分流 ----------
  const SNIFF_MAX = 32 * 1024;
  const SNIFF_TIMEOUT_MS = 10_000;

  function sniffAndRoute(socket) {
    state.inbound.add(socket);
    socket.on('close', () => state.inbound.delete(socket));
    let buf = Buffer.alloc(0);
    let done = false;
    const finish = (route, host) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      socket.removeListener('data', onData);
      socket.removeListener('close', onGone);
      socket.removeListener('error', onGone);
      if (route === 'relay') {
        // 插件连接：桥接到内部 http server（Node 22 的 http server 不接受
        // emit('connection') 注入的外部 socket，本地 TCP 桥接是可靠做法）
        if (state.httpPort == null) { socket.destroy(); return; }
        const up = net.connect(state.httpPort, '127.0.0.1');
        if (buf.length) up.write(buf);
        socket.pipe(up);
        up.pipe(socket);
        const teardown = () => { try { socket.destroy(); } catch {} try { up.destroy(); } catch {} };
        socket.on('error', teardown);
        socket.on('close', teardown);
        up.on('error', teardown);
        up.on('close', teardown);
      } else if (route === 'status') {
        const body = JSON.stringify({ ok: true, server: `dsh-relay-server/${PKG_VERSION}`, ...stats() });
        replyRaw(socket, `HTTP/1.1 200 OK\r\ncontent-type: application/json\r\ncontent-length: ${Buffer.byteLength(body)}\r\nconnection: close\r\n\r\n${body}`);
      } else {
        // 手机流量：按 Host 路由到对应客户端
        const s = resolveByHost(host);
        if (!s) {
          replyRaw(socket, 'HTTP/1.1 421 Misdirected Request\r\nConnection: close\r\n\r\nUnknown relay host\r\n');
          return;
        }
        void pipePhoneSocket(socket, buf, s);
      }
    };
    const onData = (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      if (buf.length > SNIFF_MAX) return finish('phone', '');
      const idx = buf.indexOf('\r\n\r\n');
      if (idx < 0) return;
      const head = buf.subarray(0, idx).toString('latin1');
      const reqLine = head.split('\r\n')[0] ?? '';
      const m = /^([A-Z]+) (\S+)/.exec(reqLine);
      const pathOnly = (m?.[2] ?? '').split('?')[0];
      if (pathOnly === '/__relay/status') return finish('status');
      if (pathOnly.startsWith('/__relay/')) return finish('relay');
      const hm = /^host:[ \t]*(.+)$/im.exec(head);
      return finish('phone', hm?.[1] ?? '');
    };
    const onGone = () => finish('gone');
    socket.on('data', onData);
    socket.on('close', onGone);
    socket.on('error', onGone);
    const timer = setTimeout(() => finish('phone', ''), SNIFF_TIMEOUT_MS);
    timer.unref?.();
  }

  // ---------- 启动 ----------
  function buildTlsOptions() {
    if (!cfg.tlsCert || !cfg.tlsKey) return null;
    return {
      cert: readFileSync(cfg.tlsCert),
      key: readFileSync(cfg.tlsKey),
      ALPNProtocols: ['http/1.1'], // 禁 h2：明文字节流必须可透传
    };
  }

  const tlsOpts = buildTlsOptions();
  // 统一架构：外部监听器(TLS 或裸 TCP) → sniffAndRoute → 插件连接桥接进内部 http server
  const server = tlsOpts
    ? tls.createServer(tlsOpts, (socket) => sniffAndRoute(socket))
    : net.createServer({ allowHalfOpen: true }, (socket) => sniffAndRoute(socket));

  const listen = () => new Promise((resolve, reject) => {
    internal.listen(0, '127.0.0.1', () => {
      state.httpPort = internal.address().port;
      server.once('error', reject);
      server.listen(cfg.port, cfg.host, () => resolve(server.address()));
    });
  });

  return {
    server,
    insecure: !tlsOpts,
    listen,
    stats,
    /** 客户端注册表（token 已脱敏为前 6 位，仅日志/展示用） */
    clients: registry.map((c) => ({ id: c.id, domain: c.domain, tokenHint: `${c.token.slice(0, 6)}…` })),
    close: async () => {
      for (const s of [...state.inbound]) { try { s.destroy(); } catch { /* 忽略 */ } }
      clearInterval(statsTimer);
      await new Promise((r) => server.close(r));
      await new Promise((r) => internal.close(r));
    },
    _internals: { state, sessions, sniffAndRoute },
  };
}

// ---------- CLI ----------
const CLI_USAGE = `用法:
  node src/server.mjs                       启动服务（读环境变量）
  node src/server.mjs add-client <file> <id> [domain]
                                            向注册表文件添加客户端并生成 token
  node src/server.mjs list-clients <file>   列出注册表里的客户端`;

function readRegistryFile(file) {
  if (!existsSync(file)) return { clients: [] };
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  return { clients: Array.isArray(raw) ? raw : (raw.clients ?? []) };
}

async function cli(args) {
  const [cmd, ...rest] = args;
  if (cmd === 'add-client') {
    const [file, id, domain] = rest;
    if (!file || !id) { console.error(CLI_USAGE); process.exit(1); }
    const reg = readRegistryFile(file);
    const token = crypto.randomBytes(24).toString('hex');
    reg.clients.push({ id, token, ...(domain ? { domain } : {}) });
    normalizeClients(reg.clients); // 先校验再落盘
    writeFileSync(file, `${JSON.stringify(reg, null, 2)}\n`, { mode: 0o600 });
    console.log(`client "${id}" added to ${file}`);
    console.log(`  token:  ${token}`);
    if (domain) console.log(`  domain: ${domain}`);
    return;
  }
  if (cmd === 'list-clients') {
    const [file] = rest;
    if (!file) { console.error(CLI_USAGE); process.exit(1); }
    const reg = readRegistryFile(file);
    const list = normalizeClients(reg.clients);
    for (const c of list) {
      console.log(`${c.id.padEnd(20)} domain=${c.domain || '(default 裸IP)'} token=${c.token.slice(0, 6)}…`);
    }
    if (list.length === 0) console.log('(empty)');
    return;
  }
  console.error(CLI_USAGE);
  process.exit(1);
}

// CLI 直接运行：node src/server.mjs [start] | add-client | list-clients
if (process.argv[1] && import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  if (args.length > 0 && args[0] !== 'start') {
    await cli(args);
  } else {
    const relay = createRelayServer();
    relay.listen().then((addr) => {
      const ts = () => new Date().toISOString();
      console.log(ts(), `dsh-relay-server ${PKG_VERSION} listening on ${JSON.stringify(addr)} (${relay.insecure ? 'INSECURE dev mode — set RELAY_TLS_CERT/RELAY_TLS_KEY' : 'TLS'})`);
      for (const c of relay.clients) {
        console.log(ts(), `  client ${c.id} domain=${c.domain || '(default 裸IP)'} token=${c.tokenHint}`);
      }
      console.log(ts(), `plugin connect: ${relay.insecure ? 'ws' : 'wss'}://<host>:${addr.port}/__relay/ctl`);
    }).catch((err) => {
      console.error('failed to listen:', err.message);
      process.exit(1);
    });
  }
}
