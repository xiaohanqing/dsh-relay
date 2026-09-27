// dsh-relay 服务编排：本地代理 + relay 隧道客户端 + 状态聚合

import { networkInterfaces, hostname as osHostname, platform as osPlatform, arch as osArch } from 'node:os';
import { createRequire } from 'node:module';
import { readFileSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { createRelayProxy } from './proxy.mjs';
import { RelayClient, publicUrlFromServer, httpBaseFromServer } from './relay.mjs';

const require = createRequire(import.meta.url);

export function qrDataUrl(text, { width = 220, margin = 1 } = {}) {
  const QRCode = require('qrcode');
  return QRCode.toDataURL(text, { errorCorrectionLevel: 'M', margin, width, type: 'image/png' });
}

// ---- 局域网 IPv4 探测（原创实现）----
const PRIVATE_RE = /^(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|100\.(?:6[4-9]|[7-9]\d|1(?:0\d|1\d|2[0-7]))\.)/;
const PHYSICAL_RE = /^(?:wlan|wi-?fi|wireless|eth|en\d|wlp\d|以太网|有线|无线|本地连接)/i;
const VIRTUAL_RE = /(?:tailscale|zerotier|tun|tap|vpn|virtual|vmware|virtualbox|wsl|docker|vethernet|bridge)/i;

export function selectLanIPv4(interfaces) {
  const cands = [];
  for (const [name, addrs] of Object.entries(interfaces ?? {})) {
    for (const addr of addrs ?? []) {
      if (addr.family !== 'IPv4' || addr.internal) continue;
      const ip = addr.address;
      if (!ip || ip.startsWith('127.') || ip.startsWith('169.254.')) continue;
      let score = 0;
      if (PRIVATE_RE.test(ip)) score += 100;
      if (PHYSICAL_RE.test(name)) score += 20;
      else if (VIRTUAL_RE.test(name)) score -= 50;
      cands.push({ ip, score, order: cands.length });
    }
  }
  cands.sort((a, b) => b.score - a.score || a.order - b.order);
  return cands[0]?.ip ?? null;
}

function allLanCandidates() {
  const ips = [];
  for (const addrs of Object.values(networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (addr.family !== 'IPv4' || addr.internal) continue;
      const ip = addr.address;
      if (ip && !ip.startsWith('127.') && !ip.startsWith('169.254.') && !ips.includes(ip)) ips.push(ip);
    }
  }
  return ips;
}

/**
 * @param {object} opts
 * @param {number} opts.dshPort  DSH web 端口
 * @param {object} [opts.hooks]  测试注入 { createProxy, RelayClient, qrDataUrl, lanIPv4 }
 */
export function createRelayService({
  dshPort,
  port = 3082,
  home,
  hooks = {},
  getLanIpOverride = () => '',
  getLanEnabled = () => true,
  getLanAuthEnabled = () => true,
  getPins = () => ({ public: '', lan: '' }),
  isPinCustom = () => false,
  getRelayConfig = () => ({ url: '', token: '', enabled: false }),
  saveRelayConfig = null, // async ({ url, token }) => void：准入批准/密钥轮换时持久化
  pluginVersion = '',
  onRelayReady = () => {},
  /** dsh web 浏览器会话启动 token（实时取，issue 平台契约：GET / 首次需 ?token= 换 cookie） */
  launchToken = () => '',
  log = console,
} = {}) {
  const logInfo = (...a) => (log.info ?? log.log).call(log, ...a);
  const logWarn = (...a) => log.warn?.(...a) ?? console.warn(...a);

  const createProxyFn = hooks.createProxy ?? createRelayProxy;
  const RelayClientCls = hooks.RelayClient ?? RelayClient;
  const qr = hooks.qrDataUrl ?? qrDataUrl;

  let proxy = null;
  let client = null;
  let relayState = { phase: 'idle', detail: '', attempts: 0, nextRetryAt: null, server: null };
  const qrCache = new Map();
  let lanCache = null;
  // 进程级会话密钥：PIN 的登录 cookie 绑定它，DSH 重启后手机需重新输一次密码
  const sessionKey = hooks.sessionKey ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  // 进程重启后自动恢复中继的标记（enabled 状态持久化在 settings，重启后由 index.js 调 startRelay）
  const homeDir = home ?? process.env.DSH_HOME ?? join(homedir(), '.dsh');
  const autoMarkerPath = join(homeDir, 'dsh-relay', 'relay-auto.json');
  function persistAutoMarker() {
    try {
      mkdirSync(dirname(autoMarkerPath), { recursive: true });
      writeFileSync(autoMarkerPath, JSON.stringify({ at: Date.now() }), 'utf8');
    } catch { /* 忽略 */ }
  }
  function clearAutoMarker() {
    try { rmSync(autoMarkerPath, { force: true }); } catch { /* 忽略 */ }
  }

  async function qrCached(text) {
    if (!text) return null;
    if (!qrCache.has(text)) {
      if (qrCache.size >= 8) qrCache.delete(qrCache.keys().next().value);
      qrCache.set(text, qr(text).catch(() => null));
    }
    return qrCache.get(text);
  }

  function lanIp() {
    const override = String(getLanIpOverride() ?? '').trim();
    if (override) return override;
    const now = Date.now();
    if (!lanCache || now - lanCache.at > 15_000) {
      lanCache = { at: now, ip: selectLanIPv4(networkInterfaces()) };
    }
    return lanCache.ip;
  }

  // ---------- 准入申请（客户端主动申请接入） ----------
  const ENROLL_POLL_MS = 3000;
  const ENROLL_TIMEOUT_MS = 10 * 60_000;
  let enroll = null; // {phase, serverUrl, requestId, detail, deadline, timer}

  function collectIdentity() {
    const macs = [];
    const ips = [];
    for (const addrs of Object.values(networkInterfaces())) {
      for (const addr of addrs ?? []) {
        if (addr.mac && addr.mac !== '00:00:00:00:00:00' && !macs.includes(addr.mac)) macs.push(addr.mac);
        if (addr.family === 'IPv4' && !addr.internal && !ips.includes(addr.address)) ips.push(addr.address);
      }
    }
    return {
      hostname: osHostname(),
      os: `${osPlatform()} ${osArch()}`,
      macs: macs.slice(0, 8),
      ips: ips.slice(0, 8),
      version: pluginVersion,
    };
  }

  function enrollSetState(phase, detail) {
    if (enroll) { enroll.phase = phase; enroll.detail = detail ?? ''; }
  }
  function enrollClear() {
    if (enroll?.timer) clearTimeout(enroll.timer);
    enroll = null;
  }

  /** 客户端主动申请接入：POST /__relay/enroll 后轮询直至批准/拒绝/过期。 */
  async function enrollStart(serverUrl, code = '') {
    const httpBase = httpBaseFromServer(serverUrl);
    if (!httpBase) throw new Error('服务端地址无效 | invalid server address');
    enrollClear();
    enroll = { phase: 'submitting', serverUrl, requestId: null, detail: '正在提交申请…', deadline: 0, timer: null };
    let res;
    try {
      res = await fetch(`${httpBase}/__relay/enroll`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code, info: collectIdentity() }),
        signal: AbortSignal.timeout(10_000),
      });
    } catch (err) {
      enrollSetState('error', `无法连接服务端：${err?.cause?.message ?? err?.message ?? err}`);
      return;
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) {
      const msgs = { 'bad-code': '邀请码错误', 'rate-limited': '尝试过于频繁，请稍后再试', 'pending-full': '服务端待审批队列已满', 'bad-identity': '申请被拒绝' };
      enrollSetState('error', msgs[body.error] ?? `申请失败（${res.status}）`);
      return;
    }
    enroll.requestId = body.requestId;
    enroll.deadline = Date.now() + ENROLL_TIMEOUT_MS;
    enrollSetState('pending', '申请已提交，等待管理员在服务端管理台批准…（10 分钟内有效）');
    enrollPoll();
  }

  function enrollPoll() {
    if (!enroll || enroll.phase !== 'pending') return;
    if (Date.now() > enroll.deadline) { enrollSetState('expired', '申请已过期，请重新提交'); return; }
    const tick = async () => {
      if (!enroll || enroll.phase !== 'pending') return;
      let body;
      try {
        const httpBase = httpBaseFromServer(enroll.serverUrl);
        const res = await fetch(`${httpBase}/__relay/enroll/poll`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ requestId: enroll.requestId }),
          signal: AbortSignal.timeout(8000),
        });
        body = await res.json().catch(() => ({}));
      } catch { body = null; } // 网络抖动：继续下一轮（受 deadline 兜底，有界轮询）
      if (!enroll || enroll.phase !== 'pending') return;
      const status = body?.status;
      if (status === 'pending') {
        enroll.timer = setTimeout(enrollPoll, ENROLL_POLL_MS);
        enroll.timer.unref?.();
        return;
      }
      if (status === 'approved' && body.token?.length >= 16) {
        const serverUrl = enroll.serverUrl;
        enrollClear();
        enroll = { phase: 'approved', serverUrl, requestId: null, detail: '已批准，正在建立隧道…', deadline: 0, timer: null };
        try {
          if (!saveRelayConfig) throw new Error('无法保存配置');
          await saveRelayConfig({ url: serverUrl, token: body.token });
          await api.startRelay();
          enrollSetState('done', '接入成功！隧道已建立');
        } catch (err) {
          enrollSetState('error', `接入成功但启动失败：${err?.message ?? err}`);
        }
        return;
      }
      if (status === 'denied') { enrollSetState('denied', '管理员拒绝了这次申请'); return; }
      if (status === 'expired') { enrollSetState('expired', '申请已过期，请重新提交'); return; }
      // 未知响应：继续轮询（deadline 兜底）
      enroll.timer = setTimeout(enrollPoll, ENROLL_POLL_MS);
      enroll.timer.unref?.();
    };
    tick();
  }

  const api = {
    dshPort,

    /** 启动本地代理（幂等）。端口被占自动 +1 重试。 */
    async startProxy() {
      if (proxy) return proxy;
      let lastErr = null;
      for (let p = port; p < port + 10; p++) {
        try {
          proxy = await createProxyFn({
            port: p,
            host: '0.0.0.0',
            upstream: { host: '127.0.0.1', port: dshPort },
            auth: {
              sessionKey,
              getPin: (kind) => getPins()[kind] ?? '',
              isProtected: (kind) => (kind === 'public' ? true : getLanAuthEnabled()),
            },
            lanAccessEnabled: () => getLanEnabled(),
            launchToken,
          });
          if (p !== port) logInfo(`dsh-relay: port ${port} busy, proxy on ${p} | 端口被占，改用 ${p}`);
          return proxy;
        } catch (err) {
          if (err?.code !== 'EADDRINUSE') throw err;
          lastErr = err;
        }
      }
      throw lastErr ?? new Error('proxy start failed');
    },

    /** 开启 NAS 中继（幂等）。 */
    async startRelay() {
      const cfg = getRelayConfig();
      if (!cfg.url || !cfg.token) {
        throw new Error('请先在设置里填写 NAS 服务端地址和 token | set the relay server address and token first');
      }
      const p = await this.startProxy();
      if (client?.running) return publicUrlFromServer(cfg.url);
      client = new RelayClientCls({
        serverUrl: cfg.url,
        token: cfg.token,
        proxyPort: p.inletPort ?? p.port,
        identity: collectIdentity(),
        onRotate: (token) => {
          // 服务端轮换密钥：持久化新密钥（start() 读 getRelayConfig 时即用新值）
          try { saveRelayConfig?.({ url: cfg.url, token }); } catch (err) { logWarn(`dsh-relay: persist rotated token failed: ${err?.message ?? err}`); }
        },
        log: logInfo,
        onChange: (snap) => {
          relayState = snap;
          if (snap.phase === 'ready') onRelayReady();
        },
        ...(hooks.relayHooks ? { hooks: hooks.relayHooks } : {}),
      });
      client.start();
      persistAutoMarker();
      return publicUrlFromServer(cfg.url);
    },

    stopRelay({ keepMarker = false } = {}) {
      client?.stop();
      client = null;
      relayState = { phase: 'idle', detail: '', attempts: 0, nextRetryAt: null, server: null };
      if (!keepMarker) clearAutoMarker();
    },

    /** 客户端主动申请接入 NAS（准入审批流）。 */
    async enroll(serverUrl, code = '') {
      return enrollStart(serverUrl, code);
    },
    enrollCancel() { enrollClear(); },
    enrollState() {
      return enroll ? { phase: enroll.phase, detail: enroll.detail, serverUrl: enroll.serverUrl } : { phase: 'idle', detail: '' };
    },

    /** 重启后自动恢复：上次开着中继就重新拉起。 */
    async restoreRelayIfNeeded() {
      try {
        readFileSync(autoMarkerPath, 'utf8');
      } catch { return false; }
      const cfg = getRelayConfig();
      if (!cfg.url || !cfg.token) return false;
      try {
        await this.startRelay();
        logInfo('dsh-relay: relay auto-restored | 已自动恢复 NAS 中继');
        return true;
      } catch (err) {
        logWarn(`dsh-relay: relay auto-restore failed | 自动恢复失败: ${err?.message ?? err}`);
        return false;
      }
    },

    async status() {
      const p = await this.startProxy();
      const lan = lanIp();
      const lanUrl = lan ? `http://${lan}:${p.port}` : null;
      const cfg = getRelayConfig();
      const publicUrl = client?.running ? publicUrlFromServer(cfg.url) : '';
      return {
        proxyRunning: true,
        proxyPort: p.port,
        dshPort,
        lanUrl,
        lanQr: await qrCached(lanUrl),
        lanCandidates: allLanCandidates(),
        lanIpOverride: String(getLanIpOverride() ?? ''),
        lanAuthEnabled: getLanAuthEnabled(),
        lanEnabled: getLanEnabled(),
        relayRunning: Boolean(client?.running),
        relayUrl: publicUrl || null,
        relayQr: publicUrl ? await qrCached(publicUrl) : null,
        relayState,
        relayConfig: { url: cfg.url, tokenSet: Boolean(cfg.token) },
        enroll: enroll ? { phase: enroll.phase, detail: enroll.detail, serverUrl: enroll.serverUrl } : { phase: 'idle', detail: '' },
      };
    },

    async dispose() {
      this.stopRelay({ keepMarker: true });
      enrollClear();
      if (proxy) {
        const p = proxy;
        proxy = null;
        try { await p.close(); } catch { /* 忽略 */ }
      }
    },
  };
  return api;
}
