// dsh-relay 隧道客户端：插件主动外连 NAS，维持控制连接 + 数据连接池
// 协议见 docs/protocol.md。

import WebSocket from 'ws';
import net from 'node:net';
import { randomBytes } from 'node:crypto';

const PROTOCOL = 1;
const POOL_SIZE = 8;
const PING_INTERVAL_MS = 15_000;
const PONG_TIMEOUT_MS = 20_000;
const CTL_BACKOFF_MAX_MS = 30_000;
const DATA_BACKOFF_MAX_MS = 10_000;

/** 把用户填的服务端地址归一化为 ws:// base（无尾斜杠）。 */
export function normalizeServerUrl(input) {
  let v = String(input ?? '').trim();
  if (!v) return '';
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(v)) v = `https://${v}`;
  let u;
  try { u = new URL(v); } catch { return ''; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:' && u.protocol !== 'wss:' && u.protocol !== 'ws:') return '';
  const scheme = u.protocol === 'http:' || u.protocol === 'ws:' ? 'ws' : 'wss';
  const port = u.port ? `:${u.port}` : '';
  const path = u.pathname.replace(/\/+$/, '');
  return `${scheme}://${u.hostname}${port}${path}`;
}

/** 服务端地址 → 手机访问的公网 URL（https）。 */
export function publicUrlFromServer(input) {
  const base = normalizeServerUrl(input);
  if (!base) return '';
  try {
    const u = new URL(base.replace(/^ws/, 'http'));
    u.protocol = u.protocol === 'http:' ? 'http:' : 'https:';
    u.pathname = '/';
    return u.toString().replace(/\/$/, '/');
  } catch { return ''; }
}

/** 指数退避：base*2^n，封顶 cap，±20% 抖动。 */
function backoffMs(attempt, cap) {
  const raw = Math.min(1000 * 2 ** Math.max(0, attempt - 1), cap);
  const jitter = 0.8 + randomBytes(1)[0] / 255 * 0.4; // 0.8~1.2
  return Math.floor(raw * jitter);
}

/**
 * relay 隧道客户端。
 * @param {object} opts
 * @param {string} opts.serverUrl   服务端地址（host[:port] 或完整 URL）
 * @param {string} opts.token       鉴权 token
 * @param {number} opts.proxyPort   本地代理端口（数据面注入目标 127.0.0.1:proxyPort）
 * @param {(patch:object)=>void} [opts.onChange] 状态变化回调（合并进快照）
 * @param {object} [opts.hooks]     测试注入：{ WebSocket, connectTcp }
 */
export class RelayClient {
  constructor({ serverUrl, token, proxyPort, onChange = () => {}, log = () => {}, hooks = {} }) {
    this.base = normalizeServerUrl(serverUrl);
    this.token = String(token ?? '');
    this.proxyPort = proxyPort;
    this.onChange = onChange;
    this.log = log;
    this.WS = hooks.WebSocket ?? WebSocket;
    this.connectTcp = hooks.connectTcp ?? ((port, cb) => {
      const s = net.connect(port, '127.0.0.1', () => cb(null, s));
      s.once('error', (err) => cb(err, s));
      return s;
    });

    this.stopped = true;
    this.ctl = null;
    /** @type {Set<WebSocket>} */
    this.pool = new Set();
    this.ctlAttempt = 0;
    this.ctlTimer = null;
    this.pingTimer = null;
    this.lastPong = 0;
    this.server = null; // { server, pool, phone, uptime }
    this.phase = 'idle'; // idle | connecting | ready | reconnecting | error
    this.detail = '';
    this.startedAt = null;
    this.attempts = 0;
    this.nextRetryAt = null;
    this._snapshot = { phase: 'idle', detail: '', attempts: 0, nextRetryAt: null, server: null };
  }

  _emit(patch) {
    this._snapshot = { ...this._snapshot, ...patch };
    this.onChange(this._snapshot);
  }

  snapshot() { return { ...this._snapshot }; }

  get running() { return !this.stopped; }

  start() {
    if (!this.base || !this.token) {
      this.phase = 'error';
      this._emit({ phase: 'error', detail: '未配置服务端地址或 token | server address or token missing' });
      return;
    }
    this.stopped = false;
    this.attempts = 0;
    this.startedAt = Date.now();
    this.phase = 'connecting';
    this._emit({ phase: 'connecting', detail: '连接 NAS 中继… | connecting to relay…', attempts: 0, nextRetryAt: null });
    this._connectCtl();
    for (let i = 0; i < POOL_SIZE; i++) this._connectData();
  }

  stop() {
    this.stopped = true;
    clearTimeout(this.ctlTimer);
    this.ctlTimer = null;
    clearInterval(this.pingTimer);
    this.pingTimer = null;
    try { this.ctl?.close(1000, 'stopped'); } catch { /* 忽略 */ }
    this.ctl = null;
    for (const ws of [...this.pool]) { try { ws.close(1000, 'stopped'); } catch { /* 忽略 */ } }
    this.pool.clear();
    this.phase = 'idle';
    this.attempts = 0;
    this.nextRetryAt = null;
    this.server = null;
    this._emit({ phase: 'idle', detail: '', attempts: 0, nextRetryAt: null, server: null });
  }

  dispose() { this.stop(); }

  // ---------- 控制连接 ----------
  _connectCtl() {
    if (this.stopped) return;
    let ws;
    try {
      ws = new this.WS(`${this.base}/__relay/ctl`, { headers: { 'x-relay-token': this.token } });
    } catch (err) {
      this._ctlFail(err);
      return;
    }
    this.ctl = ws;
    ws.on('open', () => {
      this.ctlAttempt = 0;
      this.attempts = 0;
      this.nextRetryAt = null;
      this.phase = 'ready';
      this.detail = '已连接 | connected';
      this._emit({ phase: 'ready', detail: this.detail, attempts: 0, nextRetryAt: null });
      this.log('relay: control connected');
      // 心跳：ping/pong 探活
      clearInterval(this.pingTimer);
      this.lastPong = Date.now();
      this.pingTimer = setInterval(() => {
        if (Date.now() - this.lastPong > PONG_TIMEOUT_MS) {
          this.log('relay: ping timeout, reconnecting');
          try { ws.terminate(); } catch { /* 忽略 */ }
          return;
        }
        try { ws.send(JSON.stringify({ type: 'ping', t: Date.now() })); } catch { /* 忽略 */ }
      }, PING_INTERVAL_MS);
      this.pingTimer.unref?.();
    });
    ws.on('message', (raw, isBinary) => {
      if (isBinary) return;
      let msg;
      try { msg = JSON.parse(String(raw)); } catch { return; }
      if (msg.type === 'pong') this.lastPong = Date.now();
      else if (msg.type === 'hello') this.server = { name: msg.server, protocol: msg.protocol, pool: msg.pool };
      else if (msg.type === 'stats') this.server = { ...this.server, phone: msg.phone, idle: msg.idle, uptime: msg.uptime };
      if (msg.type === 'hello' || msg.type === 'stats') this._emit({ server: this.server });
    });
    const drop = (err) => this._ctlFail(err ?? new Error('control connection lost'));
    ws.on('close', () => drop());
    ws.on('error', drop);
  }

  _ctlFail(err) {
    if (this.stopped) return;
    clearInterval(this.pingTimer);
    this.pingTimer = null;
    try { this.ctl?.removeAllListeners?.(); this.ctl?.close(); } catch { /* 忽略 */ }
    this.ctl = null;
    for (const ws of [...this.pool]) { try { ws.close(); } catch { /* 忽略 */ } }
    // 池连接自己有退避重连；这里只管控制连接
    this.ctlAttempt += 1;
    this.attempts = this.ctlAttempt;
    const delay = backoffMs(this.ctlAttempt, CTL_BACKOFF_MAX_MS);
    this.nextRetryAt = Date.now() + delay;
    this.phase = 'reconnecting';
    this.detail = `连接断开，${(delay / 1000).toFixed(0)}s 后第 ${this.ctlAttempt} 次重试 | retry #${this.ctlAttempt} in ${(delay / 1000).toFixed(0)}s`;
    this._emit({ phase: 'reconnecting', detail: this.detail, attempts: this.ctlAttempt, nextRetryAt: this.nextRetryAt });
    this.log(`relay: ${err.message ?? err}; retry in ${delay}ms`);
    clearTimeout(this.ctlTimer);
    this.ctlTimer = setTimeout(() => this._connectCtl(), delay);
    this.ctlTimer.unref?.();
  }

  // ---------- 数据连接池 ----------
  _connectData() {
    if (this.stopped) return;
    let ws;
    try {
      ws = new this.WS(`${this.base}/__relay/data`, { headers: { 'x-relay-token': this.token } });
    } catch {
      this._retryData(null, 1);
      return;
    }
    this.pool.add(ws);
    ws._relayAttempt = 0;

    ws.on('message', (raw, isBinary) => {
      // 首帧文本 = 绑定帧 {bind: connId}；其后二进制 = 手机字节
      if (!isBinary) {
        let msg;
        try { msg = JSON.parse(String(raw)); } catch { return; }
        if (typeof msg.bind === 'number') {
          ws._consumed = true; // 该连接已被占用，close 时不再补池（这里马上补新）
          this._connectData();
          this._bindLocal(ws, msg.bind);
        }
        return;
      }
      // 本地 TCP 未连上之前到达的字节先排队（绑定帧与手机首包几乎同时到达）
      if (ws._local) {
        try { ws._local.write(raw); } catch { /* 本地已断，teardown 会清 */ }
      } else {
        (ws._pending ??= []).push(raw);
      }
    });

    const drop = () => {
      this.pool.delete(ws);
      if (ws._local) { try { ws._local.destroy(); } catch { /* 忽略 */ } ws._local = null; }
      if (ws._consumed) return; // 绑定时已补过新连接
      this._retryData(ws, (ws._relayAttempt ?? 0) + 1);
    };
    ws.on('close', drop);
    ws.on('error', drop);
  }

  _retryData(oldWs, attempt) {
    if (this.stopped) return;
    const delay = backoffMs(attempt, DATA_BACKOFF_MAX_MS);
    const t = setTimeout(() => this._connectData(), delay);
    t.unref?.();
  }

  /** 绑定帧到达：向本地代理发起 TCP 并开始搬运。 */
  _bindLocal(ws, connId) {
    this.connectTcp(this.proxyPort, (err, socket) => {
      if (err || !socket) {
        this.log(`relay: local proxy connect failed for conn #${connId}: ${err?.message ?? err}`);
        try { ws.close(); } catch { /* 忽略 */ }
        return;
      }
      ws._local = socket;
      if (ws._pending?.length) {
        for (const chunk of ws._pending) { try { socket.write(chunk); } catch { /* 忽略 */ } }
        ws._pending = [];
      }
      socket.on('data', (chunk) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(chunk);
      });
      const teardown = () => {
        if (ws._local) { try { ws._local.destroy(); } catch { /* 忽略 */ } ws._local = null; }
        try { ws.close(); } catch { /* 忽略 */ }
      };
      socket.on('close', teardown);
      socket.on('error', teardown);
      ws.on('close', teardown);
    });
  }
}
