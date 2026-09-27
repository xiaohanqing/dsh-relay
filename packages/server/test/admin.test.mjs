// 管理面（WebUI/API）测试：鉴权、限速、客户端增删、持久化、删除即断隧道
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { WebSocket } from 'ws';

const { createRelayServer } = await import('../src/server.mjs');

const PORT = 13800;                 // 公共端口（嗅探分流）
const ADMIN_PASSWORD = 'admin-pass-0123456789';
const TOKEN_HOME = 'home-token-0123456789abcdef';

let relay;
let base;            // 内部 http server 的 http://127.0.0.1:<port>（admin 直达）
let clientsFile;
let cookie = '';

before(async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-relay-admin-'));
  clientsFile = join(dir, 'clients.json');
  writeFileSync(clientsFile, JSON.stringify({ clients: [{ id: 'home', token: TOKEN_HOME }] }));
  relay = createRelayServer({
    port: PORT, host: '127.0.0.1',
    clientsFile,
    adminPassword: ADMIN_PASSWORD,
  });
  await relay.listen();
  base = `http://127.0.0.1:${relay._internals.state.httpPort}`;
});
after(async () => { await relay.close(); });

const waitMs = (ms) => new Promise((r) => setTimeout(r, ms));

describe('管理面鉴权', () => {
  test('页面可直达，API 未登录 401', async () => {
    const page = await fetch(`${base}/__relay/admin`);
    assert.equal(page.status, 200);
    assert.ok((await page.text()).includes('dsh-relay 管理台'));
    const res = await fetch(`${base}/__relay/admin/api/overview`);
    assert.equal(res.status, 401);
  });

  test('错误密码 401；正确密码发会话 cookie', async () => {
    const bad = await fetch(`${base}/__relay/admin/api/login`, {
      method: 'POST', body: JSON.stringify({ password: 'wrong' }),
    });
    assert.equal(bad.status, 401);

    const ok = await fetch(`${base}/__relay/admin/api/login`, {
      method: 'POST', body: JSON.stringify({ password: ADMIN_PASSWORD }),
    });
    assert.equal(ok.status, 200);
    const setCookie = ok.headers.get('set-cookie');
    assert.ok(setCookie.includes('dsh_relay_admin='));
    assert.ok(/HttpOnly/.test(setCookie));
    cookie = setCookie.split(';')[0];
  });

  test('带会话的 overview：客户端明细 + 可变标记', async () => {
    const res = await fetch(`${base}/__relay/admin/api/overview`, { headers: { cookie } });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.ok, true);
    assert.equal(data.mutable, true);
    assert.equal(data.clients.length, 1);
    assert.equal(data.clients[0].id, 'home');
  });

  test('登录连错 5 次触发 429 锁定（放最后测，避免污染同 IP）', async () => {
    let locked = false;
    for (let i = 0; i < 6; i++) {
      const res = await fetch(`${base}/__relay/admin/api/login`, {
        method: 'POST', body: JSON.stringify({ password: `bad-${i}` }),
      });
      if (res.status === 429) { locked = true; break; }
    }
    assert.ok(locked, '连续失败后必须进入锁定');
  });
});

describe('页面增删客户端', () => {
  test('add：生成 token、立即生效、回写文件', async () => {
    const res = await fetch(`${base}/__relay/admin/api/clients/add`, {
      method: 'POST', headers: { cookie },
      body: JSON.stringify({ id: 'office', domain: 'office.test' }),
    });
    assert.equal(res.status, 200);
    const { token } = await res.json();
    assert.ok(token.length >= 16);

    // 新 token 立即可用（插件 ctl 连接）
    const ws = new WebSocket(`ws://127.0.0.1:${PORT}/__relay/ctl`, { headers: { 'x-relay-token': token } });
    await new Promise((r, j) => { ws.once('open', r); ws.once('error', j); });
    await waitMs(200);
    const overview = await (await fetch(`${base}/__relay/admin/api/overview`, { headers: { cookie } })).json();
    const office = overview.clients.find((c) => c.id === 'office');
    assert.ok(office, '新客户端应出现在列表');
    assert.equal(office.connected, true);
    assert.equal(office.domain, 'office.test');

    // 文件已回写
    const persisted = JSON.parse(readFileSync(clientsFile, 'utf8'));
    assert.equal(persisted.clients.length, 2);
    assert.ok(persisted.clients.some((c) => c.id === 'office' && c.token === token));

    globalThis.__officeWs = ws;
  });

  test('add：非法参数被拒且回滚（重复 token 场景由 normalizeClients 保证）', async () => {
    const res = await fetch(`${base}/__relay/admin/api/clients/add`, {
      method: 'POST', headers: { cookie },
      body: JSON.stringify({ id: 'BAD ID!' }),
    });
    assert.equal(res.status, 400);
    const overview = await (await fetch(`${base}/__relay/admin/api/overview`, { headers: { cookie } })).json();
    assert.equal(overview.clients.length, 2, '非法添加不应影响现有客户端');
  });

  test('remove：列表移除、隧道断开、文件回写', async () => {
    const ws = globalThis.__officeWs;
    const closed = new Promise((r) => ws.once('close', r));
    const res = await fetch(`${base}/__relay/admin/api/clients/remove`, {
      method: 'POST', headers: { cookie }, body: JSON.stringify({ id: 'office' }),
    });
    assert.equal(res.status, 200);
    await Promise.race([closed, waitMs(2000)]);

    const overview = await (await fetch(`${base}/__relay/admin/api/overview`, { headers: { cookie } })).json();
    assert.ok(!overview.clients.some((c) => c.id === 'office'));
    const persisted = JSON.parse(readFileSync(clientsFile, 'utf8'));
    assert.equal(persisted.clients.length, 1);
    try { ws.close(); } catch { /* 已断 */ }
  });

  test('remove：最后一个客户端不许删', async () => {
    const res = await fetch(`${base}/__relay/admin/api/clients/remove`, {
      method: 'POST', headers: { cookie }, body: JSON.stringify({ id: 'home' }),
    });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error, 'last-client');
  });
});
