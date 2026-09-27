// dsh-relay-server 单元测试：鉴权、限速、状态端点、多实例
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';

process.env.RELAY_TOKEN = 'unit-test-token-0123456789abcdef';
const { createRelayServer } = await import('../src/server.mjs');

const PORT = 13500;
const TOKEN = 'unit-test-token-0123456789abcdef';

let relay;
before(async () => {
  relay = createRelayServer({ port: PORT, host: '127.0.0.1', token: TOKEN });
  await relay.listen();
});
after(async () => { await relay.close(); });

/** 发送一段原始字节并收集响应（connection: close 语义）。 */
function rawExchange(bytes, { timeoutMs = 3000 } = {}) {
  return new Promise((resolve, reject) => {
    const s = net.connect(PORT, '127.0.0.1');
    let buf = Buffer.alloc(0);
    const timer = setTimeout(() => { s.destroy(); resolve(buf.toString('latin1')); }, timeoutMs);
    s.on('data', (d) => { buf = Buffer.concat([buf, d]); });
    s.on('error', () => { clearTimeout(timer); resolve(buf.toString('latin1')); });
    s.on('close', () => { clearTimeout(timer); resolve(buf.toString('latin1')); });
    s.on('connect', () => s.write(bytes));
  });
}

describe('dsh-relay-server', () => {
  test('/__relay/status 免鉴权返回 ok', async () => {
    const res = await rawExchange(`GET /__relay/status HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n`);
    assert.ok(res.includes('200 OK'), res);
    assert.ok(res.includes('"ok":true'), res);
  });

  test('错误 token 的 WS 握手 → 401', async () => {
    const res = await rawExchange(
      `GET /__relay/ctl HTTP/1.1\r\nHost: x\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n`
      + `Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\nSec-WebSocket-Version: 13\r\n`
      + `x-relay-token: wrong-wrong-wrong\r\nConnection: close\r\n\r\n`);
    assert.ok(res.includes('401'), res);
  });

  test('正确 token + 手机路径分流：无空闲池时手机得到 503', async () => {
    // 没有插件连接 → 池为空 → 手机连接等 bindWaitMs 后收到 503
    const res = await rawExchange(`GET / HTTP/1.1\r\nHost: dsh.example.test\r\nConnection: close\r\n\r\n`, { timeoutMs: 8000 });
    assert.ok(res.includes('503'), res);
  });

  test('stats 初始为 0', () => {
    const s = relay.stats();
    assert.equal(s.phone, 0);
    assert.equal(typeof s.uptime, 'number');
  });
});
