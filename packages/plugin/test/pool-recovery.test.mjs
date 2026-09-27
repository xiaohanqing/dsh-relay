// 回归测试：数据池 in-flight 名额泄漏（服务端长时间不可达后池永久瘫痪）
// 旧 bug：dataInflight 只在 open 成功时递减，drop 不归还 → 失败 ≥8 次后
// dataInflight >= POOL_SIZE 永真，池再也不重连（NAS 实测踩中）。
// 本测试：先让客户端对死端口撞满失败，再拉起服务端，池必须恢复。
import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.RELAY_INSECURE = '1';

const { createRelayServer } = await import('../../server/src/server.mjs');
const { RelayClient } = await import('../src/relay.mjs');

const PORT = 13520;
const TOKEN = 'pool-recovery-token-0123456789abcdef';
const waitMs = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (fn()) return true;
    await waitMs(100);
  }
  return false;
}

test('数据池在 ≥POOL_SIZE 次失败后必须能恢复', async () => {
  const client = new RelayClient({
    serverUrl: `ws://127.0.0.1:${PORT}`, // 此刻没人监听
    token: TOKEN,
    proxyPort: 1,
    log: () => {},
  });
  client.start();
  // 让失败尝试充分发生（旧代码在这里把 8 个 in-flight 名额全部漏光）
  await waitMs(2500);

  // 服务端这才上线
  const relay = createRelayServer({ port: PORT, host: '127.0.0.1', token: TOKEN });
  await relay.listen();
  try {
    const ok = await waitFor(() => relay.stats().idle >= 4, 25_000);
    const snap = client.snapshot();
    assert.ok(ok, `池未恢复: server stats=${JSON.stringify(relay.stats())} client=${JSON.stringify({ phase: snap.phase, attempts: snap.attempts })}`);
    assert.equal(snap.phase, 'ready');
  } finally {
    client.stop();
    await relay.close();
  }
});
