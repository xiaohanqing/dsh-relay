// dsh-relay-server：NAS 端中继服务（docs/protocol.md 的服务端实现）
//
// 职责：单一 TLS 端口上分流两类流量——
//   1. 手机流量：TLS 解密后的原始字节流 → 经 data 连接池透传给插件（纯字节搬运，零解析）
//   2. 插件通道：/__relay/ctl（控制 WS）+ /__relay/data（数据 WS 池），token 鉴权
//
// 所有状态都封装在 createRelayServer() 闭包内（支持同进程多实例，测试用）。

import tls from 'node:tls';
import http from 'node:http';
import crypto from 'node:crypto';
import net from 'node:net';
import { readFileSync } from 'node:fs';
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
  token: (process.env.RELAY_TOKEN ?? '').trim(),
  tokenFile: (process.env.RELAY_TOKEN_FILE ?? '').trim(),
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

export function createRelayServer(overrides = {}) {
  const cfg = { ...defaults, ...overrides };

  // ---------- token ----------
  const token = cfg.token || (() => {
    try { return readFileSync(cfg.tokenFile, 'utf8').trim(); } catch { return ''; }
  })();
  if (!token) throw new Error('RELAY_TOKEN (或 RELAY_TOKEN_FILE) 未设置——拒绝明文裸奔启动');

  // ---------- 运行状态 ----------
  const state = {
    startedAt: Date.now(),
    connIdSeq: 0,
    httpPort: null,        // 内部 http server（插件 WS upgrade）端口
    ctl: null,             // 当前控制连接
    /** @type {Map<number,{ws:WebSocket, peer:net.Socket}>} 已绑定的手机流 */
    phoneConns: new Map(),
    /** @type {Set<WebSocket>} 空闲 data 连接 */
    idleData: new Set(),
    /** @type {Set<net.Socket>} 全部入站连接（close 时统一销毁，保证快速关停） */
    inbound: new Set(),
  };

  function log(...args) {
    console.log(new Date().toISOString(), ...args);
  }
  function stats() {
    return { phone: state.phoneConns.size, idle: state.idleData.size, uptime: Math.floor((Date.now() - state.startedAt) / 1000) };
  }
  function ctlSend(obj) {
    try { state.ctl?.send(JSON.stringify(obj)); } catch { /* 连接正断 */ }
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

  function onControl(ws) {
    log('plugin control connected');
    if (state.ctl && state.ctl.readyState === WebSocket.OPEN) {
      try { state.ctl.close(4000, 'replaced'); } catch { /* 忽略 */ }
    }
    state.ctl = ws;
    ws.send(JSON.stringify({ type: 'hello', server: `dsh-relay-server/${PKG_VERSION}`, protocol: 1, pool: cfg.poolHint }));
    ctlSend({ type: 'stats', ...stats() });

    ws.on('message', (raw, isBinary) => {
      if (isBinary) return;
      let msg;
      try { msg = JSON.parse(String(raw)); } catch { return; }
      if (msg?.type === 'ping') ws.send(JSON.stringify({ type: 'pong', t: msg.t ?? 0 }));
    });
    const drop = () => {
      if (state.ctl === ws) state.ctl = null;
      log('plugin control lost');
      // 控制连接没了：已绑定手机流的对端已死，全部关闭（浏览器会自动重试）
      for (const conn of [...state.phoneConns.values()]) {
        try { conn.ws.close(1001, 'plugin offline'); } catch { /* 忽略 */ }
        try { conn.peer.destroy(); } catch { /* 忽略 */ }
      }
      for (const ws2 of [...state.idleData]) { try { ws2.close(1001, 'plugin offline'); } catch { /* 忽略 */ } }
      state.idleData.clear();
    };
    ws.on('close', drop);
    ws.on('error', drop);
  }

  function onDataSocket(ws) {
    state.idleData.add(ws);
    ws.on('close', () => state.idleData.delete(ws));
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
    if (!tokenEqual(req.headers['x-relay-token'], token)) {
      recordTokenFail(ip);
      log(`auth failed from ${ip} (${url})`);
      socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }

    if (url === '/__relay/ctl') {
      wss.handleUpgrade(req, socket, head, (ws) => onControl(ws));
    } else if (url === '/__relay/data') {
      wss.handleUpgrade(req, socket, head, (ws) => onDataSocket(ws));
    } else {
      socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
      socket.destroy();
    }
  }

  // 内部 http server：只服务插件 WS upgrade（嗅探后的连接经本地桥接进来）
  const internal = http.createServer((req, res) => {
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end('{"error":"not-found"}');
  });
  internal.on('upgrade', handleUpgrade);

  // 数据面统计推送
  const statsTimer = setInterval(() => ctlSend({ type: 'stats', ...stats() }), 10_000);
  statsTimer.unref?.();

  // ---------- 数据面 ----------
  async function bindDataConn() {
    const take = () => {
      const ws = state.idleData.values().next().value;
      if (!ws) return null;
      state.idleData.delete(ws);
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

  /** 手机流量入口：原始字节流整体透传（head 为嗅探期间缓存的首包）。 */
  async function pipePhoneSocket(socket, head) {
    const connId = ++state.connIdSeq;
    const ws = await bindDataConn();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      socket.end('HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\nNo tunnel available\r\n');
      return;
    }
    state.phoneConns.set(connId, { ws, peer: socket });
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
      state.phoneConns.delete(connId);
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
    const finish = (route) => {
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
        const body = JSON.stringify({ ok: true, server: `dsh-relay-server/${PKG_VERSION}` });
        socket.end(`HTTP/1.1 200 OK\r\ncontent-type: application/json\r\ncontent-length: ${Buffer.byteLength(body)}\r\nconnection: close\r\n\r\n${body}`);
      } else {
        // 手机流量：整条字节流透传给插件
        void pipePhoneSocket(socket, buf);
      }
    };
    const onData = (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      if (buf.length > SNIFF_MAX) return finish('phone');
      const idx = buf.indexOf('\r\n\r\n');
      if (idx < 0) return;
      const head = buf.subarray(0, idx).toString('latin1');
      const reqLine = head.split('\r\n')[0] ?? '';
      const m = /^([A-Z]+) (\S+)/.exec(reqLine);
      const pathOnly = (m?.[2] ?? '').split('?')[0];
      if (pathOnly === '/__relay/status') return finish('status');
      if (pathOnly.startsWith('/__relay/')) return finish('relay');
      return finish('phone');
    };
    const onGone = () => finish('gone');
    socket.on('data', onData);
    socket.on('close', onGone);
    socket.on('error', onGone);
    const timer = setTimeout(() => finish('phone'), SNIFF_TIMEOUT_MS);
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
    token,
    insecure: !tlsOpts,
    listen,
    stats,
    close: async () => {
      for (const s of [...state.inbound]) { try { s.destroy(); } catch { /* 忽略 */ } }
      clearInterval(statsTimer);
      await new Promise((r) => server.close(r));
      await new Promise((r) => internal.close(r));
    },
    _internals: { state, sniffAndRoute },
  };
}

// CLI 直接运行：node src/server.mjs
if (process.argv[1] && import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href) {
  const relay = createRelayServer();
  relay.listen().then((addr) => {
    console.log(new Date().toISOString(), `dsh-relay-server ${PKG_VERSION} listening on ${JSON.stringify(addr)} (${relay.insecure ? 'INSECURE dev mode — set RELAY_TLS_CERT/RELAY_TLS_KEY' : 'TLS'})`);
    console.log(new Date().toISOString(), `plugin connect: ${relay.insecure ? 'ws' : 'wss'}://<host>:${addr.port}/__relay/ctl`);
  }).catch((err) => {
    console.error('failed to listen:', err.message);
    process.exit(1);
  });
}
