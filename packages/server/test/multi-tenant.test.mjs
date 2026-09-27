// 多租户测试：token 归属、Host 路由、客户端隔离、默认客户端兜底、注册表校验
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { WebSocket, WebSocketServer } from 'ws';

const { createRelayServer, normalizeClients } = await import('../src/server.mjs');

const PORT_M = 13600;      // 双客户端实例
const PORT_D = 13610;      // 纯域名实例（无默认客户端）

const TOKEN_A = 'token-a-0123456789abcdef';
const TOKEN_B = 'token-b-0123456789abcdef';

let relayM;
let relayD;
before(async () => {
  relayM = createRelayServer({
    port: PORT_M, host: '127.0.0.1',
    clients: [
      { id: 'alpha', token: TOKEN_A, domain: 'alpha.test' },
      { id: 'default', token: TOKEN_B },
    ],
  });
  await relayM.listen();
  relayD = createRelayServer({
    port: PORT_D, host: '127.0.0.1',
    clients: [{ id: 'only', token: TOKEN_A, domain: 'only.test' }],
  });
  await relayD.listen();
});
after(async () => { await relayM.close(); await relayD.close(); });

const waitMs = (ms) => new Promise((r) => setTimeout(r, ms));
/** 等到 stats 里某客户端 idle 数达到 want（data ws 注册是异步的）。 */
async function waitIdle(relay, clientId, want, timeoutMs = 2000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const c = relay.stats().clients.find((x) => x.id === clientId);
    if (c && c.idle >= want) return;
    await waitMs(25);
  }
  throw new Error(`waitIdle(${clientId}, ${want}) 超时: ${JSON.stringify(relay.stats())}`);
}

/** 模拟插件：建立 ctl + data 池，返回 {ctl, dataSockets, hello}。 */
function pluginConnect(port, token, poolSize = 1) {
  const h = { 'x-relay-token': token };
  const ctl = new WebSocket(`ws://127.0.0.1:${port}/__relay/ctl`, { headers: h });
  const dataSockets = [];
  const hello = new Promise((resolve, reject) => {
    ctl.once('message', (raw) => {
      try { resolve(JSON.parse(String(raw))); } catch (e) { reject(e); }
    });
    ctl.once('error', reject);
  });
  const ready = hello.then(async () => {
    for (let i = 0; i < poolSize; i++) {
      const ws = new WebSocket(`ws://127.0.0.1:${port}/__relay/data`, { headers: h });
      dataSockets.push(ws);
      await new Promise((resolve, reject) => { ws.once('open', resolve); ws.once('error', reject); });
    }
  });
  return { ctl, dataSockets, hello, ready };
}

/** 发送一段原始字节并收集响应（connection: close 语义）。 */
function rawExchange(bytes, { timeoutMs = 3000 } = {}) {
  return new Promise((resolve) => {
    const s = net.connect(PORT_M, '127.0.0.1');
    let buf = Buffer.alloc(0);
    const timer = setTimeout(() => { s.destroy(); resolve(buf.toString('latin1')); }, timeoutMs);
    s.on('data', (d) => { buf = Buffer.concat([buf, d]); });
    s.on('error', () => { clearTimeout(timer); resolve(buf.toString('latin1')); });
    s.on('close', () => { clearTimeout(timer); resolve(buf.toString('latin1')); });
    s.on('connect', () => s.write(bytes));
  });
}

/** 让一个 data ws 充当插件数据端：收到 bind+head 后回固定 HTTP 响应。 */
function serveViaData(ws, marker) {
  ws.on('message', (raw, isBinary) => {
    if (isBinary) {
      const body = JSON.stringify({ marker, saw: raw.toString('latin1').split('\r\n')[0] });
      // 必须是 Buffer（binary 帧）：服务端绑定后只透传 binary，text 帧会被防注入丢弃
      ws.send(Buffer.from(`HTTP/1.1 200 OK\r\ncontent-type: application/json\r\ncontent-length: ${Buffer.byteLength(body)}\r\nconnection: close\r\n\r\n${body}`));
    }
  });
}

describe('客户端注册表校验', () => {
  test('合法注册表通过并归一 domain', () => {
    const list = normalizeClients([
      { id: 'a', token: TOKEN_A, domain: 'A.Test:8443' },
      { id: 'b', token: TOKEN_B },
    ]);
    assert.equal(list[0].domain, 'a.test');
    assert.equal(list[1].domain, '');
  });
  test('重复 token / 短 token / 重复 domain / 坏 id 均拒绝', () => {
    assert.throws(() => normalizeClients([{ id: 'a', token: TOKEN_A }, { id: 'b', token: TOKEN_A }]), /token/);
    assert.throws(() => normalizeClients([{ id: 'a', token: 'short' }]), /太短/);
    assert.throws(() => normalizeClients([{ id: 'a', token: TOKEN_A, domain: 'x.test' }, { id: 'b', token: TOKEN_B, domain: 'x.test' }]), /domain/);
    assert.throws(() => normalizeClients([{ id: 'BAD ID', token: TOKEN_A }]), /id/);
  });
});

describe('多客户端路由', () => {
  test('每个客户端收到自己的 hello（含 client id）', async () => {
    const pa = pluginConnect(PORT_M, TOKEN_A);
    const helloA = await pa.hello;
    assert.equal(helloA.client, 'alpha');
    const pb = pluginConnect(PORT_M, TOKEN_B);
    const helloB = await pb.hello;
    assert.equal(helloB.client, 'default');
    await pa.ready; await pb.ready;
    await waitIdle(relayM, 'alpha', 1);
    await waitIdle(relayM, 'default', 1);
    pa.clientObj = pa; pb.clientObj = pb;
    globalThis.__pa = pa; globalThis.__pb = pb;
  });

  test('Host 路由：alpha.test 的手机流量只进 alpha 的池', async () => {
    const pa = globalThis.__pa; const pb = globalThis.__pb;
    let bGotTraffic = false;
    pb.dataSockets[0].on('message', () => { bGotTraffic = true; });
    serveViaData(pa.dataSockets[0], 'alpha-marker');

    const res = await rawExchange(
      `GET / HTTP/1.1\r\nHost: alpha.test\r\nConnection: close\r\n\r\n`, { timeoutMs: 5000 });
    assert.ok(res.includes('200 OK'), res);
    assert.ok(res.includes('alpha-marker'), res);
    await waitMs(150);
    assert.equal(bGotTraffic, false, '默认客户端的池不应收到 alpha 的流量');
  });

  test('未匹配 Host 落到默认客户端并被其服务', async () => {
    const pb = globalThis.__pb;
    serveViaData(pb.dataSockets[0], 'default-marker');
    const res = await rawExchange(
      `GET / HTTP/1.1\r\nHost: anything-else.test\r\nConnection: close\r\n\r\n`, { timeoutMs: 5000 });
    assert.ok(res.includes('200 OK'), res);
    assert.ok(res.includes('default-marker'), res);
  });

  test('stats 聚合 + 每客户端明细', () => {
    const s = relayM.stats();
    assert.equal(s.clients.length, 2);
    const ids = s.clients.map((c) => c.id).sort();
    assert.deepEqual(ids, ['alpha', 'default']);
    assert.equal(typeof s.phone, 'number');
    assert.equal(typeof s.uptime, 'number');
  });

  test('无默认客户端时未匹配 Host → 421（纯域名实例）', async () => {
    const res = await new Promise((resolve) => {
      const s = net.connect(PORT_D, '127.0.0.1');
      let buf = Buffer.alloc(0);
      const timer = setTimeout(() => { s.destroy(); resolve(buf.toString('latin1')); }, 3000);
      s.on('data', (d) => { buf = Buffer.concat([buf, d]); });
      s.on('error', () => { clearTimeout(timer); resolve(buf.toString('latin1')); });
      s.on('close', () => { clearTimeout(timer); resolve(buf.toString('latin1')); });
      s.on('connect', () => s.write(`GET / HTTP/1.1\r\nHost: not-only.test\r\nConnection: close\r\n\r\n`));
    });
    assert.ok(res.includes('421'), res);
  });

  test('裸 IP（无 Host 头信息）落到默认客户端', async () => {
    const res = await rawExchange(
      `GET / HTTP/1.1\r\nHost: 192.168.31.70\r\nConnection: close\r\n\r\n`, { timeoutMs: 8000 });
    // 默认客户端(default)没有空闲池 → 503 而不是 421，说明路由到了默认客户端
    assert.ok(res.includes('503'), res);
  });
});

describe('CLI 启动路径', () => {
  test('node src/server.mjs 能起来并响应 status（防启动块回归）', async () => {
    const port = 13720;
    const child = spawn(process.execPath, ['src/server.mjs'], {
      cwd: fileURLToPath(new URL('..', import.meta.url)),
      env: { ...process.env, RELAY_TOKEN: 'cli-boot-token-0123456789abcdef', RELAY_PORT: String(port), RELAY_HOST: '127.0.0.1' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (d) => { output += d; });
    child.stderr.on('data', (d) => { output += d; });
    try {
      const deadline = Date.now() + 8000;
      let ok = false;
      while (Date.now() < deadline) {
        ok = await new Promise((resolve) => {
          const s = net.connect(port, '127.0.0.1');
          let buf = Buffer.alloc(0);
          s.on('data', (d) => { buf = Buffer.concat([buf, d]); s.destroy(); resolve(buf.toString('latin1').includes('"ok":true')); });
          s.on('error', () => resolve(false));
          s.on('connect', () => s.write('GET /__relay/status HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n'));
        });
        if (ok) break;
        await waitMs(200);
      }
      assert.ok(ok, `CLI 启动失败: ${output}`);
      assert.ok(output.includes('client default'), output);
    } finally {
      child.kill('SIGTERM');
    }
  });
});
