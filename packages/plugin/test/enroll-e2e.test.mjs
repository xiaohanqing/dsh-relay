// 准入全链路 e2e：真实服务端 + 真实服务编排
//   service.enroll(地址) → 服务端出现待审批 → 管理台批准 → 插件自动拿到密钥并建立隧道
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

process.env.RELAY_INSECURE = '1';

const { createRelayServer } = await import('../../server/src/server.mjs');
const { createRelayProxy } = await import('../src/proxy.mjs');
const { createRelayService } = await import('../src/service.mjs');

const PORT_RELAY = 13100;
const PORT_PROXY = 13101;
const ADMIN_PASSWORD = 'e2e-admin-pass-0123456789';

let relay;
let stub;
let stubPort;
let proxy;
let service;
let base;
let cookie = '';
let savedConfig = null;

before(async () => {
  stub = http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<!doctype html><html><body>stub-dsh</body></html>');
  });
  await new Promise((r) => stub.listen(0, '127.0.0.1', r));
  stubPort = stub.address().port;
});

describe('准入全链路', () => {
  test('申请 → 批准 → 自动建隧道', async () => {
    const dir = (await import('node:fs')).mkdtempSync((await import('node:path')).join((await import('node:os')).tmpdir(), 'dsh-relay-enroll-e2e-'));
    const clientsFile = `${dir}/clients.json`;
    (await import('node:fs')).writeFileSync(clientsFile, JSON.stringify({ clients: [] }));
    relay = createRelayServer({ port: PORT_RELAY, host: '127.0.0.1', clientsFile, adminPassword: ADMIN_PASSWORD });
    await relay.listen();
    base = `http://127.0.0.1:${relay._internals.state.httpPort}`;

    proxy = await createRelayProxy({
      port: PORT_PROXY, host: '127.0.0.1',
      upstream: { host: '127.0.0.1', port: stubPort },
      auth: { sessionKey: 'e2e', getPin: () => '12345678', isProtected: () => true },
      launchToken: () => '',
      log: () => {},
    });

    service = createRelayService({
      dshPort: stubPort,
      port: PORT_PROXY,
      saveRelayConfig: async ({ url, token }) => { savedConfig = { url, token }; },
      getRelayConfig: () => ({ url: savedConfig?.url ?? '', token: savedConfig?.token ?? '', enabled: true }),
      hooks: {},
      log: { info: () => {}, warn: () => {}, error: () => {} },
    });

    // 客户端申请（异步流程，不等待完成）
    await service.enroll(`ws://127.0.0.1:${PORT_RELAY}`, '');
    assert.equal(service.enrollState().phase, 'pending');

    // 管理台批准
    const login = await fetch(`${base}/__relay/admin/api/login`, {
      method: 'POST', body: JSON.stringify({ password: ADMIN_PASSWORD }),
    });
    cookie = login.headers.get('set-cookie').split(';')[0];
    const list = await (await fetch(`${base}/__relay/admin/api/enroll/list`, { headers: { cookie } })).json();
    assert.equal(list.pending.length, 1);
    const approve = await (await fetch(`${base}/__relay/admin/api/enroll/approve`, {
      method: 'POST', headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ requestId: list.pending[0].id, clientId: 'e2e-pc' }),
    })).json();
    assert.equal(approve.ok, true);

    // 插件应在数秒内 poll 到批准并自动建隧道
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
      const st = service.enrollState();
      if (st.phase === 'done') break;
      if (st.phase === 'error') throw new Error(st.detail);
      await new Promise((r) => setTimeout(r, 250));
    }
    assert.equal(service.enrollState().phase, 'done', service.enrollState().detail);
    assert.ok(savedConfig?.token?.length >= 16, '密钥应已持久化');

    // 等隧道 ready，然后手机路径端到端
    const deadline2 = Date.now() + 10_000;
    while (Date.now() < deadline2) {
      const st = await service.status();
      if (st.relayState.phase === 'ready') break;
      await new Promise((r) => setTimeout(r, 250));
    }
    const st = await service.status();
    assert.equal(st.relayState.phase, 'ready');
  });

  after(async () => {
    await service?.dispose();
    await relay?.close();
    stub?.close();
  });
});
