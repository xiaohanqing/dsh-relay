// 隧道注入口（tunnel inlet）安全契约 e2e：
//   1. 只监听 127.0.0.1；
//   2. 其上流量一律按公网强制 PIN —— 即使伪造 Host: 127.0.0.1 也不能免密；
//   3. ?token=<PIN> 通过后正常代理到上游（含头改写）。
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createServer as createHttpServer } from 'node:http';
import { get } from 'node:http';

import { createRelayProxy } from '../src/proxy.mjs';

function fetchRaw(port, path, headers = {}) {
  return new Promise((res, rej) => {
    get({ host: '127.0.0.1', port, path, headers }, (r) => {
      let body = '';
      r.on('data', (c) => { body += c; });
      r.on('end', () => res({ status: r.statusCode, body, headers: r.headers }));
    }).on('error', rej);
  });
}

describe('tunnel inlet security contract', () => {
  const PIN = '12345678';

  async function setup() {
    const upstream = createHttpServer((req, res) => {
      res.writeHead(200, { 'content-type': 'text/plain' });
      res.end(`upstream host=${req.headers.host} path=${req.url}`);
    });
    await new Promise((r) => upstream.listen(0, '127.0.0.1', r));
    const proxy = await createRelayProxy({
      port: 0,
      upstream: { host: '127.0.0.1', port: upstream.address().port },
      auth: { sessionKey: 'test-key', getPin: () => PIN, isProtected: () => true },
      tunnelPort: 0, // 随机端口（测试不与开发机 3083 冲突）
    });
    return { upstream, proxy };
  }

  test('无 PIN → 登录页；伪造 loopback Host 不能免密', async () => {
    const { upstream, proxy } = await setup();
    try {
      const noAuth = await fetchRaw(proxy.tunnelPort, '/');
      assert.equal(noAuth.status, 200);
      assert.match(noAuth.body, /访问验证|PIN-protected/);
      // 关键：隧道来源必为 loopback，攻击者伪造 Host: 127.0.0.1 试图按本机免密 → 仍被拦
      const spoofed = await fetchRaw(proxy.tunnelPort, '/', { host: '127.0.0.1' });
      assert.equal(spoofed.status, 200);
      assert.match(spoofed.body, /访问验证|PIN-protected/);
      assert.ok(!spoofed.body.includes('upstream host='), '绝不能穿透到上游');
    } finally {
      await proxy.close();
      upstream.close();
    }
  });

  test('?token=<PIN> → 通过并代理（Host 改写为上游权威）', async () => {
    const { upstream, proxy } = await setup();
    try {
      const okRes = await fetchRaw(proxy.tunnelPort, `/?token=${PIN}`, { host: 'tunnel.example.com' });
      assert.equal(okRes.status, 200);
      assert.match(okRes.body, /upstream host=127\.0\.0\.1:\d+/);
      assert.match(okRes.body, /path=\//);
      // 登录 cookie 已种下：后续请求免 token
      const cookie = (okRes.headers['set-cookie'] ?? []).map((c) => c.split(';')[0]).join('; ');
      assert.match(cookie, /dsh_relay_auth=/);
      const withCookie = await fetchRaw(proxy.tunnelPort, '/foo', { cookie });
      assert.equal(withCookie.status, 200);
      assert.match(withCookie.body, /path=\/foo/);
    } finally {
      await proxy.close();
      upstream.close();
    }
  });

  test('错误 token 计入限速，连续 5 次锁定', async () => {
    const { upstream, proxy } = await setup();
    try {
      let last;
      for (let i = 0; i < 7; i++) {
        last = await fetchRaw(proxy.tunnelPort, '/?token=wrong000');
      }
      // GET 上的锁定表现为登录页锁定文案（429 仅用于 POST /auth/login 提交）
      assert.match(last.body, /尝试次数过多|Try again in/);
    } finally {
      await proxy.close();
      upstream.close();
    }
  });
});
