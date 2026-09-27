// 准入审批 + 密钥轮换 测试
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { WebSocket } from 'ws';

const { createRelayServer } = await import('../src/server.mjs');

const PORT = 13900;
const ADMIN_PASSWORD = 'admin-pass-0123456789';
const TOKEN_HOME = 'home-token-0123456789abcdef';

let relay;
let base;
let clientsFile;
let settingsFile;
let cookie = '';

const IDENTITY = {
  hostname: 'lab-pc', os: 'linux x64', version: '0.3.0',
  macs: ['aa:bb:cc:dd:ee:ff'], ips: ['192.168.31.5'],
};

before(async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-relay-enroll-'));
  clientsFile = join(dir, 'clients.json');
  settingsFile = join(dir, 'settings.json');
  writeFileSync(clientsFile, JSON.stringify({ clients: [{ id: 'home', token: TOKEN_HOME }] }));
  relay = createRelayServer({
    port: PORT, host: '127.0.0.1',
    clientsFile, settingsFile,
    adminPassword: ADMIN_PASSWORD,
  });
  await relay.listen();
  base = `http://127.0.0.1:${relay._internals.state.httpPort}`;
  const res = await fetch(`${base}/__relay/admin/api/login`, {
    method: 'POST', body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  cookie = res.headers.get('set-cookie').split(';')[0];
});
after(async () => { await relay.close(); });

const waitMs = (ms) => new Promise((r) => setTimeout(r, ms));
const post = (path, body, headers = {}) =>
  fetch(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });

describe('准入申请', () => {
  test('申请 → 待审批列表含身份档案 → 批准 → poll 拿到密钥 → 新 token 可连', async () => {
    const enroll = await (await post('/__relay/enroll', { info: IDENTITY })).json();
    assert.equal(enroll.ok, true);
    assert.ok(enroll.requestId);

    const list = await (await fetch(`${base}/__relay/admin/api/enroll/list`, { headers: { cookie } })).json();
    assert.equal(list.pending.length, 1);
    assert.equal(list.pending[0].info.hostname, 'lab-pc');
    assert.equal(list.pending[0].info.macs[0], 'aa:bb:cc:dd:ee:ff');
    assert.equal(list.pending[0].info.ips[0], '192.168.31.5');

    const approve = await (await post('/__relay/admin/api/enroll/approve', {
      requestId: enroll.requestId, clientId: 'lab', domain: '',
    }, { cookie })).json();
    assert.equal(approve.ok, true);
    assert.equal(approve.clientId, 'lab');

    const poll = await (await post('/__relay/enroll/poll', { requestId: enroll.requestId })).json();
    assert.equal(poll.status, 'approved');
    assert.equal(poll.clientId, 'lab');
    assert.ok(poll.token.length >= 16);

    // 新 token 立即可用
    const ws = new WebSocket(`ws://127.0.0.1:${PORT}/__relay/ctl`, { headers: { 'x-relay-token': poll.token } });
    await new Promise((r, j) => { ws.once('open', r); ws.once('error', j); });
    await waitMs(150);
    const overview = await (await fetch(`${base}/__relay/admin/api/overview`, { headers: { cookie } })).json();
    const lab = overview.clients.find((c) => c.id === 'lab');
    assert.equal(lab.connected, true);
    assert.equal(lab.identity.hostname, 'lab-pc', '连接后上报身份应入档');
    ws.close();
  });

  test('拒绝：poll 返回 denied', async () => {
    const enroll = await (await post('/__relay/enroll', { info: { hostname: 'stranger' } })).json();
    await post('/__relay/admin/api/enroll/deny', { requestId: enroll.requestId }, { cookie });
    const poll = await (await post('/__relay/enroll/poll', { requestId: enroll.requestId })).json();
    assert.equal(poll.status, 'denied');
  });

  test('邀请码开启后：无码 403，有码通过；关闭后恢复开放', async () => {
    const set = await (await post('/__relay/admin/api/settings', { enrollCode: 'invite-8888' }, { cookie })).json();
    assert.equal(set.ok, true);
    const noCode = await post('/__relay/enroll', { info: { hostname: 'x' } });
    assert.equal(noCode.status, 403);
    const withCode = await (await post('/__relay/enroll', { info: { hostname: 'x' }, code: 'invite-8888' })).json();
    assert.equal(withCode.ok, true);
    await post('/__relay/admin/api/settings', { enrollCode: '' }, { cookie });
    const openAgain = await (await post('/__relay/enroll', { info: { hostname: 'x' } })).json();
    assert.equal(openAgain.ok, true, '关闭邀请码后应恢复开放申请');
  });

  test('未知的 requestId poll → expired；申请频率超限 429', async () => {
    const poll = await (await post('/__relay/enroll/poll', { requestId: 'nope' })).json();
    assert.equal(poll.status, 'expired');
    let limited = false;
    for (let i = 0; i < 15; i++) {
      const res = await post('/__relay/enroll', { info: { hostname: `spam-${i}` } });
      if (res.status === 429) { limited = true; break; }
    }
    assert.ok(limited, '申请频率超限必须 429');
  });
});

describe('密钥轮换', () => {
  test('手动轮换：已连接客户端收到 rotate 推送，新旧 token 宽限期内都可用', async () => {
    // 用 home token 连上
    const ws = new WebSocket(`ws://127.0.0.1:${PORT}/__relay/ctl`, { headers: { 'x-relay-token': TOKEN_HOME } });
    await new Promise((r, j) => { ws.once('open', r); ws.once('error', j); });
    const rotateMsg = new Promise((resolve) => {
      ws.on('message', (raw) => {
        try { const m = JSON.parse(String(raw)); if (m.type === 'rotate') resolve(m); } catch { /* 忽略 */ }
      });
    });
    await waitMs(150);

    const res = await (await post('/__relay/admin/api/clients/rotate', { id: 'home' }, { cookie })).json();
    assert.equal(res.ok, true);
    const msg = await Promise.race([rotateMsg, waitMs(2000).then(() => null)]);
    assert.ok(msg, '客户端应收到 rotate 推送');
    assert.ok(msg.token.length >= 16);

    // 新 token 可用
    const ws2 = new WebSocket(`ws://127.0.0.1:${PORT}/__relay/ctl`, { headers: { 'x-relay-token': msg.token } });
    await new Promise((r, j) => { ws2.once('open', r); ws2.once('error', j); });
    ws2.close();
    // 旧 token 宽限期内仍可用（轮换后插件旧连接断开重连的窗口）
    const ws3 = new WebSocket(`ws://127.0.0.1:${PORT}/__relay/ctl`, { headers: { 'x-relay-token': TOKEN_HOME } });
    await new Promise((r, j) => { ws3.once('open', r); ws3.once('error', j); });
    ws3.close();
    ws.close();
  });

  test('轮换后的注册表持久化包含新 token 与 issuedAt', async () => {
    const overview = await (await fetch(`${base}/__relay/admin/api/overview`, { headers: { cookie } })).json();
    const home = overview.clients.find((c) => c.id === 'home');
    assert.ok(home.tokenHint !== 'home-t…', '旧 token 前缀不应还在');
    const persisted = JSON.parse(readFileSync(clientsFile, 'utf8'));
    const p = persisted.clients.find((c) => c.id === 'home');
    assert.ok(Number.isFinite(p.issuedAt));
  });

  test('settings 持久化：rotateDays 写入文件并可回读', async () => {
    await post('/__relay/admin/api/settings', { rotateDays: 7 }, { cookie });
    const saved = JSON.parse(readFileSync(settingsFile, 'utf8'));
    assert.equal(saved.rotateDays, 7);
  });
});

describe('改域名与事件', () => {
  test('改域名即时生效（手机 Host 路由跟着变）并持久化', async () => {
    const res = await (await post('/__relay/admin/api/clients/domain', { id: 'home', domain: 'dsh.new' }, { cookie })).json();
    assert.equal(res.ok, true);
    const persisted = JSON.parse(readFileSync(clientsFile, 'utf8'));
    assert.equal(persisted.clients.find((c) => c.id === 'home').domain, 'dsh.new');
    const events = await (await fetch(`${base}/__relay/admin/api/events`, { headers: { cookie } })).json();
    assert.ok(events.events.some((e) => e.text.includes('dsh.new')));
  });
});
