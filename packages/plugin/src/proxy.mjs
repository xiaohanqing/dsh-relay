// dsh-relay 本地反向代理：手机/NAS 隧道进来的请求 → 改写成 loopback 权威 → DSH web
//
// DSH web 的浏览器信任栅栏只认 loopback（且官方禁 0.0.0.0 绑定）。本代理把入站
// 请求的 Host/Origin/Referer/Sec-Fetch-Site 统一改写为 127.0.0.1:<dshPort>，
// HTTP 与 WebSocket 均原样透传，手机看到的页面与电脑完全一致、实时同步。
//
// 另外处理三件平台层的事（均为对 DSH 平台行为的适配，代码为本项目原创）：
//   1. 浏览器会话握手：新版 dsh web 要求 GET / 首次带 ?token=<启动token> 换 cookie；
//      Safari 在 http://IP 源上不保存 3xx 的 cookie，需要对 303 做 200 过渡页处理。
//   2. 非安全上下文 polyfill：局域网 http://IP 下缺 crypto.randomUUID / AbortSignal.any。
//   3. 访问密码：8 位 PIN，公网（NAS 域名）强制，局域网按开关；限速防穷举。

import { createServer } from 'node:http';
import { request as httpRequest } from 'node:http';
import { createHash, timingSafeEqual, randomInt } from 'node:crypto';

const UPSTREAM = { host: '127.0.0.1', port: 3080 };

// ---------- 来源分类 ----------
// loopback(0) < lan(1) < public(2)；仅用于"只收紧不放松"的判定下限。

const PRIVATE_RE = /^(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|100\.(?:6[4-9]|[7-9]\d|1(?:0\d|1\d|2[0-7]))\.)/;

export function hostClass(host) {
  let name = String(host ?? '').trim().toLowerCase();
  if (name.startsWith('[')) {
    const end = name.indexOf(']');
    if (end >= 0) name = name.slice(1, end);
  } else {
    name = name.replace(/:\d+$/, '');
  }
  if (name === 'localhost' || name === '0.0.0.0' || name === '::1' || /^127\./.test(name)) return 'loopback';
  if (PRIVATE_RE.test(name)) return 'lan';
  if (/^(?:fe80:|f[cd][0-9a-f]{2}:)/.test(name) && name.includes(':')) return 'lan';
  if (name === '' || name.includes(':')) return 'loopback';
  if (name.endsWith('.local') || !name.includes('.')) return 'lan';
  return 'public';
}

export function sourceClass(addr) {
  let a = String(addr ?? '').trim().toLowerCase();
  if (!a) return null;
  if (a.startsWith('::ffff:')) a = a.slice(7);
  if (a === '::1' || /^127\./.test(a)) return 'loopback';
  if (PRIVATE_RE.test(a) || /^169\.254\./.test(a)) return 'lan';
  if (/^(?:fe80:|f[cd][0-9a-f]{2}:)/.test(a)) return 'lan';
  return 'public';
}

const RANK = { loopback: 0, lan: 1, public: 2 };

/**
 * 策略判定用的 Host：Host 头完全由客户端控制，可能谎称自己是 loopback/局域网
 * 来绕过公网密码。用不可伪造的 TCP 源地址给它设下限——只收紧，不放松。
 */
export function policyHost(req, host) {
  const actual = sourceClass(req?.socket?.remoteAddress);
  if (!actual) return host;
  const claimed = hostClass(host);
  if (RANK[actual] <= RANK[claimed]) return host;
  let addr = String(req.socket.remoteAddress);
  if (addr.toLowerCase().startsWith('::ffff:')) addr = addr.slice(7);
  return addr;
}

// ---------- polyfill 注入（原创实现，仅缺失时生效） ----------

export const POLYFILL_HTML = `<script data-dsh-relay-polyfill="1">!function(){try{if(!(self.crypto&&self.crypto.randomUUID)){var u=new Uint8Array(16);self.crypto=self.crypto||{};self.crypto.randomUUID=function(){self.crypto.getRandomValues(u);u[6]=u[6]&15|64;u[8]=u[8]&63|128;var h="";for(var i=0;i<16;i++){h+=(i===4||i===6||i===8||i===10?"-":"")+u[i].toString(16).padStart(2,"0");}return h;};}}catch(e){}}();
!function(){try{if(self.AbortSignal&&!self.AbortSignal.any){self.AbortSignal.any=function(list){list=Array.from(list||[]);var ctl=new AbortController();var done=false;function relay(){if(done)return;for(var i=0;i<list.length;i++){if(list[i].aborted){done=true;try{ctl.abort(list[i].reason);}catch(e){ctl.abort();}break;}}}for(var i=0;i<list.length;i++){list[i].addEventListener("abort",relay,{once:true});}relay();return ctl.signal;};}}catch(e){}}();
!function(){try{var K="__DSH_TRANSPORT__";function fix(t){try{if(t&&typeof t==="object"&&typeof t.createApiClient!=="function"){t.createApiClient=function(){return null;};}}catch(e){}return t;}var cur=globalThis[K];if(cur)fix(cur);Object.defineProperty(globalThis,K,{configurable:true,enumerable:true,get:function(){return cur;},set:function(v){cur=fix(v);}});}catch(e){}}();</script>`;

const POLYFILL_MARK = 'data-dsh-relay-polyfill="1"';

function isCompressed(headers) {
  return /(^|,\s*)(gzip|br|deflate)(\s*,|$)/i.test(String(headers['content-encoding'] ?? ''));
}

function isHtmlRequest(req) {
  const accept = String(req.headers.accept ?? '');
  if (accept.includes('text/html')) return true;
  let pathname = String(req.url ?? '/');
  try { pathname = new URL(req.url || '/', 'http://x').pathname; } catch { /* 原值 */ }
  return pathname === '/' || /\.html?$/i.test(pathname);
}

// ---------- 访问密码 ----------

export const PIN_RE = /^[a-zA-Z0-9]{8}$/;

export function newPin() {
  return String(randomInt(10_000_000, 100_000_000)); // CSPRNG
}

const AUTH_COOKIE = 'dsh_relay_auth';
const COOKIE_MAX_AGE = 30 * 24 * 3600;

function cookieValue(pin, sessionKey) {
  return sessionKey
    ? createHash('sha256').update(`${pin}:${sessionKey}`).digest('hex')
    : pin;
}

function safeEqual(a, b) {
  const ba = Buffer.from(String(a ?? ''), 'utf8');
  const bb = Buffer.from(String(b ?? ''), 'utf8');
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function parseCookies(header) {
  const out = {};
  for (const part of String(header ?? '').split(';')) {
    const eq = part.indexOf('=');
    if (eq > 0) out[part.slice(0, eq).trim()] = decodeURIComponent(part.slice(eq + 1).trim());
  }
  return out;
}

function loginPageHtml(error, isPublic, retryAfter = 0) {
  const where = isPublic ? 'This public address' : 'This LAN address';
  const whereZh = isPublic ? '此公网地址' : '此局域网地址';
  const errMsg = error === 'locked'
    ? `尝试次数过多，请 ${retryAfter} 秒后再试 | Try again in ${retryAfter}s`
    : error ? '密码错误，请重试 | Wrong PIN' : '';
  return `<!doctype html><html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DSH Relay · 访问验证</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:28px 24px;max-width:320px;width:calc(100% - 48px);text-align:center}
h1{font-size:16px;margin:0 0 4px;color:#111827}p{font-size:13px;color:#6b7280;margin:0 0 16px}
input{width:100%;box-sizing:border-box;padding:10px 12px;font-size:18px;letter-spacing:6px;text-align:center;border:1px solid #d1d5db;border-radius:8px;outline:none;margin-bottom:12px}
button{width:100%;padding:10px;font-size:15px;background:#4f6ef7;color:#fff;border:none;border-radius:8px;cursor:pointer}
.err{color:#dc2626;font-size:12px;margin-bottom:10px;min-height:16px}</style>
</head><body><div class="card"><h1>🔐 DSH Relay</h1>
<p>${whereZh}受访问密码保护，请输入 8 位密码 | ${where} is PIN-protected (8 chars)</p>
<div class="err">${errMsg}</div>
<form method="post" action="/auth/login">
<input name="token" type="password" maxlength="8" autocomplete="one-time-code" autofocus required>
<button type="submit">进入 | Enter</button></form></div></body></html>`;
}

function lanDisabledPageHtml() {
  return `<!doctype html><html lang="zh"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>DSH Relay · 局域网访问已关闭</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f3f4f6;font-family:-apple-system,sans-serif}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:28px 24px;max-width:360px;text-align:center}
h1{font-size:16px;color:#111827;margin:0 0 8px}p{font-size:13px;color:#6b7280;margin:0;line-height:1.6}</style>
</head><body><div class="card"><h1>🔒 DSH Relay</h1>
<p>局域网访问已关闭。<br>请在电脑上的设置页重新开启。<br><br>LAN access is disabled. Re-enable it on the computer.</p>
</div></body></html>`;
}

function transitionPageHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=/"><title>DSH Relay</title></head><body style="font-family:sans-serif;color:#6b7280">正在进入… | opening…</body></html>`;
}

// 简单限速：单 IP 60s 内失败≥5 次 → 锁 60s；全局 50 次 → 锁 30s
export function createRateLimiter() {
  const perIp = new Map();
  const global_ = { count: 0, windowStart: 0, lockedUntil: 0 };
  return {
    status(ip) {
      const now = Date.now();
      if (global_.lockedUntil > now) return { locked: true, retryAfter: Math.ceil((global_.lockedUntil - now) / 1000) };
      const until = perIp.get(ip)?.lockedUntil ?? 0;
      if (until > now) return { locked: true, retryAfter: Math.ceil((until - now) / 1000) };
      return { locked: false, retryAfter: 0 };
    },
    record(ip) {
      const now = Date.now();
      let rec = perIp.get(ip);
      if (!rec || now - rec.windowStart > 60_000) rec = { count: 0, windowStart: now, lockedUntil: 0 };
      rec.count += 1;
      if (rec.count >= 5) rec.lockedUntil = now + 60_000;
      perIp.set(ip, rec);
      if (now - global_.windowStart > 60_000) { global_.count = 0; global_.windowStart = now; }
      if (++global_.count >= 50) global_.lockedUntil = now + 30_000;
    },
    clear(ip) { perIp.delete(ip); },
  };
}

function clientIp(req) {
  return req.socket?.remoteAddress || 'unknown';
}

// ---------- 请求头改写 ----------

function loopbackHeaders(headers, upstream) {
  const authority = `${upstream.host}:${upstream.port}`;
  const out = {};
  for (const [k, v] of Object.entries(headers)) {
    const lk = k.toLowerCase();
    if (lk === 'host' || lk === 'origin' || lk === 'referer' || lk === 'sec-fetch-site') continue;
    out[lk] = v;
  }
  out.host = authority;
  out.origin = `http://${authority}`;
  if (headers.referer) {
    try {
      const ref = new URL(String(headers.referer));
      ref.protocol = 'http:';
      ref.host = authority;
      out.referer = ref.toString();
    } catch { out.referer = `http://${authority}/`; }
  }
  out['sec-fetch-site'] = 'same-origin';
  return out;
}

// ---------- 浏览器会话握手（launch token） ----------

const DSH_AUTH_COOKIE_PREFIX = 'dsh-auth-';
const HANDSHAKE_LIMIT = 3;
const HANDSHAKE_WINDOW_MS = 60_000;

function createHandshakeTracker() {
  const hits = new Map();
  return {
    record(ip, now = Date.now()) {
      let rec = hits.get(ip);
      if (!rec || now - rec.start > HANDSHAKE_WINDOW_MS) { rec = { count: 1, start: now }; hits.set(ip, rec); return 1; }
      return ++rec.count;
    },
    clear(ip) { hits.delete(ip); },
    exhausted(ip) { return (hits.get(ip)?.count ?? 0) >= HANDSHAKE_LIMIT; },
  };
}

function hasDshAuthCookie(cookieHeader) {
  return String(cookieHeader ?? '').includes(DSH_AUTH_COOKIE_PREFIX);
}

/** GET / 时补 launch token（已有 cookie 或超限则不补）。返回改写后的路径。 */
export function withLaunchToken(reqUrl, req, launchToken, tracker) {
  if (req.method !== 'GET') return reqUrl;
  let u;
  try { u = new URL(reqUrl || '/', 'http://x'); } catch { return reqUrl; }
  if (u.pathname !== '/') return reqUrl;
  if (hasDshAuthCookie(req.headers.cookie)) return reqUrl;
  const ip = clientIp(req);
  if (tracker.exhausted(ip)) return reqUrl;
  const token = launchToken();
  if (!token) return reqUrl;
  tracker.record(ip);
  u.searchParams.set('token', token);
  return `${u.pathname}${u.search}`;
}

// ---------- 代理主体 ----------

/**
 * 创建本地反向代理。
 * @param {object} opts
 * @param {number} opts.port             监听端口（默认 3082）
 * @param {{host:string,port:number}} [opts.upstream] DSH web（默认 127.0.0.1:3080）
 * @param {object} [opts.auth]           { getPin(kind), isProtected(kind), sessionKey }
 *                                       kind: 'public' | 'lan'；isProtected 返回是否要求密码
 * @param {() => boolean} [opts.lanAccessEnabled]  局域网访问开关（默认开）
 * @param {() => string} [opts.launchToken] dsh web 启动 token（实时取）
 * @param {boolean} [opts.injectPolyfills] 是否注入 polyfill（默认 true）
 */
export function createRelayProxy({
  port = 3082,
  host = '0.0.0.0',
  upstream = UPSTREAM,
  auth = null,
  lanAccessEnabled = () => true,
  launchToken = () => '',
  injectPolyfills = true,
  log = () => {},
} = {}) {
  const limiter = auth ? createRateLimiter() : null;
  const handshake = createHandshakeTracker();

  /** 该请求归属哪种 PIN（'public'|'lan'|null=免密）。 */
  function pinKindFor(req) {
    const host = policyHost(req, String(req.headers.host ?? ''));
    const cls = hostClass(host);
    if (cls === 'public') return 'public';
    if (cls === 'lan') return 'lan';
    // loopback 来源 + loopback Host（本机直接访问）免密；relay 隧道注入的流量源是
    // loopback 但 Host 是公网域名，已被上面 public 分支捕获。
    return null;
  }

  function authCheck(req, pin) {
    const expectedCookie = cookieValue(pin, auth?.sessionKey);
    const cookies = parseCookies(req.headers.cookie);
    if (cookies[AUTH_COOKIE] && safeEqual(cookies[AUTH_COOKIE], expectedCookie)) return { ok: true, seed: null };
    let qTok = null;
    try { qTok = new URL(req.url || '/', 'http://x').searchParams.get('token'); } catch { /* 无 */ }
    if (qTok && safeEqual(qTok, pin)) return { ok: true, seed: qTok };
    return { ok: false, seed: null };
  }

  function seedCookie(res, rawPin) {
    const origWriteHead = res.writeHead.bind(res);
    res.writeHead = function (status, headers) {
      const h = { ...(headers ?? {}) };
      const cookie = `${AUTH_COOKIE}=${cookieValue(rawPin, auth?.sessionKey)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${COOKIE_MAX_AGE}`;
      const prev = h['set-cookie'];
      if (Array.isArray(prev)) h['set-cookie'] = [...prev, cookie];
      else if (typeof prev === 'string') h['set-cookie'] = [prev, cookie];
      else h['set-cookie'] = cookie;
      return origWriteHead(status, h);
    };
  }

  const server = createServer((req, res) => {
    const host = policyHost(req, String(req.headers.host ?? ''));
    const cls = hostClass(host);

    // 局域网开关：只拦局域网来源；公网与本机放行（公网另有 PIN 把守）
    if (cls === 'lan' && !lanAccessEnabled()) {
      if (isHtmlRequest(req)) {
        res.writeHead(403, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
        res.end(lanDisabledPageHtml());
      } else {
        res.writeHead(403, { 'content-type': 'application/json' });
        res.end('{"error":"lan-disabled"}');
      }
      return;
    }

    // 访问密码
    if (auth) {
      const kind = pinKindFor(req);
      const protectedKind = kind === 'public' ? true : (kind === 'lan' ? auth.isProtected('lan') : false);
      if (protectedKind) {
        const pin = auth.getPin(kind);
        if (pin) {
          const ip = clientIp(req);
          // 登录提交
          if (req.method === 'POST' && (req.url || '').startsWith('/auth/login')) {
            const rl = limiter.status(ip);
            if (rl.locked) {
              res.writeHead(429, { 'content-type': 'text/html; charset=utf-8', 'retry-after': String(rl.retryAfter) });
              res.end(loginPageHtml('locked', kind === 'public', rl.retryAfter));
              return;
            }
            let body = '';
            req.on('data', (c) => { body += c; if (body.length > 1024) req.destroy(); });
            req.on('end', () => {
              const submitted = String(new URLSearchParams(body).get('token') ?? '');
              if (safeEqual(submitted, pin)) {
                limiter.clear(ip);
                seedCookie(res, pin);
                res.writeHead(302, { location: '/' });
                res.end();
              } else {
                limiter.record(ip);
                res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
                res.end(loginPageHtml(true, kind === 'public'));
              }
            });
            return;
          }
          const result = authCheck(req, pin);
          if (!result.ok) {
            // 带了 ?token= 的请求视为一次尝试，计数
            if ((req.url || '').includes('token=')) limiter.record(ip);
            if (isHtmlRequest(req)) {
              const rl = limiter.status(ip);
              res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
              res.end(loginPageHtml(rl.locked ? 'locked' : true, kind === 'public', rl.retryAfter));
            } else {
              res.writeHead(401, { 'content-type': 'application/json' });
              res.end('{"error":"unauthorized"}');
            }
            return;
          }
          if (result.seed) {
            limiter.clear(ip);
            seedCookie(res, result.seed);
          }
        }
      }
    }

    // 会话握手：GET / 且无 dsh-auth cookie → 注入 launch token
    const cleanPath = req.url;
    const upstreamPath = withLaunchToken(cleanPath, req, launchToken, handshake);
    const didInject = upstreamPath !== cleanPath;
    if (!didInject && hasDshAuthCookie(req.headers.cookie)) handshake.clear(clientIp(req));

    const headers = loopbackHeaders({ ...req.headers }, upstream);
    const proxyReq = httpRequest(
      { host: upstream.host, port: upstream.port, method: req.method, path: upstreamPath, headers, agent: false },
      (proxyRes) => {
        const contentType = String(proxyRes.headers['content-type'] ?? '');
        // Safari 不保存 http://IP 源上 3xx 的 cookie：把注入后的 303 改成 200 过渡页
        if (didInject && proxyRes.statusCode === 303 && isHtmlRequest(req)) {
          const out = { ...proxyRes.headers };
          delete out['content-length'];
          delete out['transfer-encoding'];
          delete out['location'];
          const page = Buffer.from(transitionPageHtml());
          out['content-type'] = 'text/html; charset=utf-8';
          out['content-length'] = String(page.length);
          out['cache-control'] = 'no-store';
          proxyRes.resume();
          res.writeHead(200, out);
          res.end(page);
          return;
        }
        // polyfill 注入：未压缩 HTML
        if (injectPolyfills && contentType.includes('text/html') && !isCompressed(proxyRes.headers)) {
          const chunks = [];
          proxyRes.on('data', (c) => chunks.push(c));
          proxyRes.on('end', () => {
            let html = Buffer.concat(chunks).toString('utf8');
            if (!html.includes(POLYFILL_MARK)) {
              html = html.replace(/<head[^>]*>/i, (m) => `${m}${POLYFILL_HTML}`);
            }
            const out = Buffer.from(html, 'utf8');
            const outHeaders = { ...proxyRes.headers };
            delete outHeaders['content-length'];
            delete outHeaders['transfer-encoding'];
            outHeaders['content-length'] = String(out.length);
            outHeaders['cache-control'] = 'no-store';
            delete outHeaders['etag'];
            res.writeHead(proxyRes.statusCode ?? 200, outHeaders);
            res.end(out);
          });
          proxyRes.on('error', () => res.destroy());
          return;
        }
        res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
        proxyRes.pipe(res);
        res.on('close', () => proxyRes.destroy());
        proxyRes.on('error', () => res.destroy());
        proxyRes.on('close', () => { if (!res.writableEnded) res.destroy(); });
      },
    );
    proxyReq.on('error', (err) => {
      if (!res.headersSent) res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
      res.end(`dsh-relay: 无法连接上游 dsh web（${upstream.host}:${upstream.port}）——先启动 dsh web | upstream unreachable: ${err.message}`);
    });
    req.pipe(proxyReq);
  });

  // WebSocket upgrade 原样透传（含 Host/Origin 改写与 PIN 校验）
  server.on('upgrade', (req, socket, head) => {
    const host = policyHost(req, String(req.headers.host ?? ''));
    const cls = hostClass(host);
    if (cls === 'lan' && !lanAccessEnabled()) {
      socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }
    if (auth) {
      const kind = pinKindFor(req);
      const protectedKind = kind === 'public' ? true : (kind === 'lan' ? auth.isProtected('lan') : false);
      if (protectedKind) {
        const pin = auth.getPin(kind);
        if (pin && !authCheck(req, pin).ok) {
          socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
          socket.destroy();
          return;
        }
      }
    }
    const headers = loopbackHeaders({ ...req.headers }, upstream);
    const proxyReq = httpRequest({
      host: upstream.host, port: upstream.port, method: req.method, path: req.url, headers, agent: false,
    });
    proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
      socket.write('HTTP/1.1 101 Switching Protocols\r\n');
      const raw = [];
      for (const [k, v] of Object.entries(proxyRes.headers)) {
        raw.push(`${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
      }
      socket.write(`${raw.join('\r\n')}\r\n\r\n`);
      if (proxyHead?.length) socket.write(proxyHead);
      socket.pipe(proxySocket, { end: false });
      proxySocket.pipe(socket, { end: false });
      // 心跳：30s Ping，连续 2 周期无入站字节 → 断链重建（防 NAT/省电静默杀连接）
      let misses = 0;
      const heartbeat = setInterval(() => {
        misses += 1;
        if (misses >= 2) { try { socket.destroy(); } catch { /* 忽略 */ } return; }
        try { socket.write(Buffer.from([0x89, 0x00])); } catch { /* 忽略 */ }
      }, 30_000);
      heartbeat.unref?.();
      socket.on('data', () => { misses = 0; });
      const teardown = () => {
        clearInterval(heartbeat);
        try { proxySocket.resetAndDestroy?.() ?? proxySocket.destroy(); } catch { try { proxySocket.destroy(); } catch {} }
        try { socket.destroy(); } catch {}
      };
      proxySocket.on('error', () => { try { socket.destroy(); } catch {} });
      proxySocket.on('close', teardown);
      socket.on('close', teardown);
      socket.on('end', teardown);
      proxySocket.on('end', teardown);
    });
    proxyReq.on('response', (proxyRes) => {
      if (proxyRes.statusCode === 101) return;
      try {
        const raw = [`HTTP/1.1 ${proxyRes.statusCode} ${proxyRes.statusMessage ?? ''}`.trim()];
        for (const [k, v] of Object.entries(proxyRes.headers)) {
          raw.push(`${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
        }
        socket.end(raw.join('\r\n') + '\r\n\r\n');
        proxyRes.resume();
      } catch { socket.destroy(); }
    });
    proxyReq.on('error', () => socket.destroy());
    if (head?.length) proxyReq.write(head);
    proxyReq.end();
    socket.on('error', () => socket.destroy());
  });

  // 连接跟踪：close() 时全量销毁（含 upgrade 后的裸 socket）
  const sockets = new Set();
  server.on('connection', (sock) => {
    sockets.add(sock);
    sock.on('close', () => sockets.delete(sock));
    sock.on('error', () => {});
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      resolve({
        server,
        port: server.address().port,
        close: () => new Promise((r) => {
          for (const s of sockets) { try { s.destroy(); } catch { /* 忽略 */ } }
          server.close(() => r());
        }),
      });
    });
  });
}
