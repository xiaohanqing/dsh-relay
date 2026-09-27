// dsh-relay 端到端回环测试：
//   stub DSH web ← 真实本地代理 ← RelayClient ← 真实 relay server ← 模拟手机(raw TCP)
// 覆盖：HTTP 透传、PIN 认证、polyfill 注入、WS upgrade、断线重连。
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import net from 'node:net';

process.env.RELAY_INSECURE = '1'; // 测试环境无证书：server 走纯 HTTP 模式

const { createRelayServer } = await import('../../server/src/server.mjs');
const { createRelayProxy } = await import('../src/proxy.mjs');
const { RelayClient } = await import('../src/relay.mjs');

const PORT_PROXY = 13082;
const PORT_RELAY = 13443;
const PIN = '12345678';
const TOKEN = 'test-token-0123456789abcdef';
const HOST = 'dsh.example.test';

let stub;      // 假装 DSH web
let stubPort = 0;
let proxy;     // 本地代理
let relay;     // relay server
let client;    // RelayClient

before(async () => {
  // stub DSH web：/ 返回 HTML（验证 polyfill 注入），/api/json 返回 JSON，/ws 回 101
  stub = http.createServer((req, res) => {
    if (req.url === '/api/json') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ upstream: 'stub', host: req.headers.host }));
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(`<!doctype html><html><head><title>stub-dsh</title></head><body>hello from stub host=${req.headers.host} origin=${req.headers.origin ?? ''}</body></html>`);
  });
  stub.on('upgrade', (req, socket) => {
    socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n\r\n');
    socket.on('data', (b) => socket.write(b)); // echo
    socket.on('error', () => { try { socket.destroy(); } catch { /* 忽略 */ } });
  });
  await new Promise((r) => stub.listen(0, '127.0.0.1', r));
  stubPort = stub.address().port;

  proxy = await createRelayProxy({
    port: PORT_PROXY,
    host: '127.0.0.1',
    upstream: { host: '127.0.0.1', port: stubPort },
    auth: {
      sessionKey: 'test-session',
      getPin: (kind) => PIN,
      isProtected: () => true,
    },
    launchToken: () => '',
    log: () => {},
  });

  relay = createRelayServer({ port: PORT_RELAY, host: '127.0.0.1', token: TOKEN });
  await relay.listen();

  client = new RelayClient({
    serverUrl: `ws://127.0.0.1:${PORT_RELAY}`,
    token: TOKEN,
    proxyPort: PORT_PROXY,
    log: () => {},
  });
  client.start();
  // 等控制连接 + 池就绪
  await waitFor(() => client.snapshot().phase === 'ready' && relay.stats().idle >= 4, 5000);
});

const withTimeout = (label, p, ms = 2000) => Promise.race([
  Promise.resolve(p).then(() => console.log('CLOSED OK:', label)),
  new Promise((r) => setTimeout(() => { console.log('CLOSE HUNG:', label); r(); }, ms)),
]);

after(async () => {
  client?.dispose();
  await withTimeout('relay', relay?.close());
  await withTimeout('proxy', proxy?.close());
  await withTimeout('stub', stub?.close());
});

async function waitFor(fn, timeoutMs, step = 50) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fn()) return;
    await new Promise((r) => setTimeout(r, step));
  }
  throw new Error('waitFor timeout');
}

/** 模拟手机：经 relay 服务器建立一条完整 HTTP 会话（多请求复用 keep-alive 连接）。 */
function phoneAgent() {
  const socket = net.connect(PORT_RELAY, '127.0.0.1');
  socket.setNoDelay(true);
  let buf = Buffer.alloc(0);
  const pending = [];
  socket.on('data', (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    while (true) {
      const idx = buf.indexOf('\r\n\r\n');
      if (idx < 0) return;
      const head = buf.subarray(0, idx).toString('utf8');
      const statusLine = head.split('\r\n')[0];
      const headers = {};
      for (const line of head.split('\r\n').slice(1)) {
        const c = line.indexOf(':');
        if (c > 0) headers[line.slice(0, c).trim().toLowerCase()] = line.slice(c + 1).trim();
      }
      let body;
      if (/connection:\s*close/i.test(head)) {
        if (!socket.readableEnded) return;
        body = buf.subarray(idx + 4).toString('utf8');
        buf = Buffer.alloc(0);
      } else if (/transfer-encoding:\s*chunked/i.test(head)) {
        // chunked：等终止块 0\r\n\r\n 再解码（stub 的无 content-length 响应）
        const term = buf.indexOf('\r\n0\r\n\r\n', idx);
        if (term < 0) return;
        const chunked = buf.subarray(idx + 4, term + 2).toString('utf8');
        buf = buf.subarray(term + 7);
        body = chunked.split('\r\n').filter((_, i) => i % 2 === 1).join('');
      } else {
        const len = Number(headers['content-length'] ?? 0);
        if (buf.length < idx + 4 + len) return;
        body = buf.subarray(idx + 4, idx + 4 + len).toString('utf8');
        buf = buf.subarray(idx + 4 + len);
      }
      const p = pending.shift();
      if (p) p({ status: Number(statusLine.split(' ')[1]), headers, body });
    }
  });
  const request = (method, path, extraHeaders = '') => new Promise((resolve, reject) => {
    pending.push(resolve);
    socket.write(`${method} ${path} HTTP/1.1\r\nHost: ${HOST}\r\nConnection: keep-alive\r\n${extraHeaders}\r\n`);
  });
  const close = () => socket.destroy();
  socket.on('error', () => {});
  return { request, close };
}

describe('dsh-relay 端到端', () => {
  test('未认证请求 → 401/登录页', async () => {
    const phone = phoneAgent();
    const res = await phone.request('GET', '/api/json');
    assert.equal(res.status, 401);
    phone.close();
  });

  test('?token= 认证 → 200 + polyfill 注入 + Host/Origin 改写', async () => {
    const phone = phoneAgent();
    const res = await phone.request('GET', `/?token=${PIN}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.includes('stub-dsh'), '应返回 stub 页面');
    assert.ok(res.body.includes('data-dsh-relay-polyfill'), '应注入 polyfill');
    assert.ok(res.body.includes('host=127.0.0.1'), '上游看到的 Host 应为 loopback 权威');
    assert.ok(res.body.includes('origin=http://127.0.0.1'), '上游看到的 Origin 应被改写');
    assert.ok(res.headers['set-cookie']?.includes('dsh_relay_auth='), '应种认证 cookie');
    phone.close();
  });

  test('cookie 认证 + JSON 透传（keep-alive 复用）', async () => {
    const phone = phoneAgent();
    const login = await phone.request('GET', `/?token=${PIN}`);
    const cookie = (login.headers['set-cookie'] ?? '').split(';')[0];
    assert.ok(cookie);
    const res = await phone.request('GET', '/api/json', `Cookie: ${cookie}\r\n`);
    assert.equal(res.status, 200);
    const parsed = JSON.parse(res.body);
    assert.equal(parsed.upstream, 'stub');
    assert.equal(parsed.host, `127.0.0.1:${stubPort}`);
    phone.close();
  });

  test('错误 PIN 的 ?token= → 401', async () => {
    const phone = phoneAgent();
    const res = await phone.request('GET', '/api/json?token=00000000');
    assert.equal(res.status, 401);
    phone.close();
  });

  test('WebSocket upgrade 经隧道透传', async () => {
    const phone = phoneAgent();
    // 先拿 cookie
    const login = await phone.request('GET', `/?token=${PIN}`);
    const cookie = (login.headers['set-cookie'] ?? '').split(';')[0];
    phone.close();

    // 独立 socket 发 upgrade（Connection: Upgrade 由底层管理，直接裸收）
    const ws = net.connect(PORT_RELAY, '127.0.0.1');
    let buf = '';
    ws.on('data', (c) => { buf += c.toString('utf8'); });
    await new Promise((resolve) => ws.once('connect', resolve));
    await new Promise((r) => setTimeout(r, 20));
    ws.write(`GET /api/ws HTTP/1.1\r\nHost: ${HOST}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nSec-WebSocket-Version: 13\r\nCookie: ${cookie}\r\n\r\n`);
    await waitFor(() => buf.includes('101'), 5000);
    ws.write(Buffer.from([0x81, 0x05, 0x68, 0x65, 0x6c, 0x6c, 0x6f])); // 未掩码 "hello"（测试直连）
    await waitFor(() => buf.includes('hello'), 5000);
    ws.destroy();
  });

  test('token 错误的插件连接 → 401（服务端拒绝升级）', async () => {
    // 用独立端口的一次性服务端：token 失败锁定按来源 IP 计，别污染主端口的锁桶
    const srv2 = createRelayServer({ port: PORT_RELAY + 1, host: '127.0.0.1', token: TOKEN });
    await srv2.listen();
    const bad = new RelayClient({
      serverUrl: `ws://127.0.0.1:${PORT_RELAY + 1}`,
      token: 'wrong-token-wrong-token',
      proxyPort: PORT_PROXY,
      log: () => {},
    });
    bad.start();
    await new Promise((r) => setTimeout(r, 700));
    assert.notEqual(bad.snapshot().phase, 'ready');
    bad.dispose();
    await srv2.close();
  });

  test('服务端重启 → 客户端自动重连恢复', async () => {
    // 杀掉 server，等客户端进入 reconnecting
    await relay.close();
    await waitFor(() => client.snapshot().phase === 'reconnecting', 8000);
    // 原地重启一个同配置 server
    relay = createRelayServer({ port: PORT_RELAY, host: '127.0.0.1', token: TOKEN });
    await relay.listen();
    await waitFor(() => client.snapshot().phase === 'ready' && relay.stats().idle >= 4, 15000);
    // 重连后链路可用
    const phone = phoneAgent();
    const res = await phone.request('GET', `/api/json?token=${PIN}`);
    assert.equal(res.status, 200);
    phone.close();
  });

  test('手机并发 12 条连接 > 池大小 8：应全部成功（池自动补充）', async () => {
    const phones = Array.from({ length: 12 }, () => phoneAgent());
    const results = await Promise.all(phones.map((p) => p.request('GET', `/api/json?token=${PIN}`)));
    for (const res of results) assert.equal(res.status, 200);
    phones.forEach((p) => p.close());
  });
});
