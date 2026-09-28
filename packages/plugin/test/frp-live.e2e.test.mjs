// frp 真机 e2e：真实 frps + 真实 frpc + 真实 proxy，全链路验证隧道适配器。
// 需要 frp 二进制：设 FRP_BIN 为包含 frpc/frps 的目录（或 frpc 完整路径），否则整组跳过。
//   FRP_BIN=/path/to/frp_0.71.0_linux_amd64 node --test test/frp-live.e2e.test.mjs
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { get } from 'node:http';
import { createServer as createHttpServer } from 'node:http';
import net from 'node:net';

import { createRelayProxy } from '../src/proxy.mjs';
import { createTunnelManager } from '../src/tunnel.mjs';

const FRP_BIN = process.env.FRP_BIN ?? '';

function httpGet(port, path) {
  return new Promise((res, rej) => {
    get({ host: '127.0.0.1', port, path }, (r) => {
      let body = '';
      r.on('data', (c) => { body += c; });
      r.on('end', () => res({ status: r.statusCode, body }));
    }).on('error', rej);
  });
}

function waitPort(port, timeoutMs = 15_000) {
  const t0 = Date.now();
  return new Promise((res, rej) => {
    const tick = () => {
      const s = new net.Socket();
      s.setTimeout(800);
      s.on('connect', () => { s.destroy(); res(); });
      s.on('error', () => s.destroy());
      s.on('timeout', () => s.destroy());
      s.on('close', () => {
        if (Date.now() - t0 > timeoutMs) rej(new Error(`port ${port} not up in ${timeoutMs}ms`));
        else setTimeout(tick, 300);
      });
      s.connect(port, '127.0.0.1');
    };
    tick();
  });
}

describe('frp live e2e', { skip: !FRP_BIN && 'FRP_BIN not set (real frpc/frps binaries required)' }, () => {
  const dir = FRP_BIN.endsWith('frpc') ? FRP_BIN.slice(0, FRP_BIN.lastIndexOf('/')) : FRP_BIN;
  const frpc = join(dir, 'frpc');
  const frps = join(dir, 'frps');
  const work = mkdtempSync(join(tmpdir(), 'relay-frp-live-'));
  const TOKEN = 'frp-live-e2e-token-0123456789abcdef';
  const FRPS_PORT = 17100 + Math.floor(Math.random() * 100);
  const REMOTE_PORT = FRPS_PORT + 282; // 落在 allowPorts 范围内

  let frpsProc = null;
  let proxy = null;
  let manager = null;
  const frpsLog = [];

  test('frps 起动 + 适配器配置通过真实 frpc verify + 全链路 PIN 页', async () => {
    // 1. frps
    const frpsToml = [
      'bindAddr = "127.0.0.1"',
      `bindPort = ${FRPS_PORT}`,
      `auth.token = "${TOKEN}"`,
      `allowPorts = [{ start = ${FRPS_PORT + 200}, end = ${FRPS_PORT + 399} }]`,
    ].join('\n');
    writeFileSync(join(work, 'frps.toml'), frpsToml, 'utf8');
    frpsProc = spawn(frps, ['-c', join(work, 'frps.toml')], { stdio: ['ignore', 'pipe', 'pipe'] });
    frpsProc.stderr.on('data', (d) => frpsLog.push(String(d)));
    await waitPort(FRPS_PORT);

    // 2. 上游 stub + 本地代理（随机注入口）
    const upstream = createHttpServer((req, res) => {
      res.writeHead(200, { 'content-type': 'text/plain' });
      res.end(`upstream-ok path=${req.url}`);
    });
    await new Promise((r) => upstream.listen(0, '127.0.0.1', r));
    proxy = await createRelayProxy({
      port: 0,
      upstream: { host: '127.0.0.1', port: upstream.address().port },
      auth: { sessionKey: 'live', getPin: () => '12345678', isProtected: () => true },
      tunnelPort: 0,
    });
    // 3. 真实 frpc 经适配器跑起来
    manager = createTunnelManager({ home: work, localPort: proxy.tunnelPort, log: { info: () => {}, warn: () => {} } });
    const snap = await manager.start({
      tool: 'frp',
      config: { binPath: frpc, serverAddr: '127.0.0.1', serverPort: FRPS_PORT, token: TOKEN, proxyType: 'tcp', remotePort: REMOTE_PORT },
    });
    assert.equal(snap.phase, 'running');
    assert.equal(snap.publicUrl, `http://127.0.0.1:${REMOTE_PORT}`);

    // 4. 公网口 → 应是 PIN 登录页（真实 frps 转发到注入端口 → 强制公网 PIN）
    let page = null;
    const t0 = Date.now();
    for (;;) {
      try {
        page = await httpGet(REMOTE_PORT, '/');
        if (page.status === 200) break;
      } catch { /* frpc 还没连上 */ }
      if (Date.now() - t0 > 20_000) throw new Error(`frp chain not reachable in 20s; frps log:\n${frpsLog.join('')}`);
      await new Promise((r) => setTimeout(r, 500));
    }
    assert.match(page.body, /访问验证|PIN-protected/);
    const ok = await httpGet(REMOTE_PORT, `/?token=12345678`);
    assert.match(ok.body, /upstream-ok path=\//);

    // 5. stop → frpc 进程组必须被收割
    const pid = manager.snapshot().pid;
    manager.stop();
    await new Promise((r) => setTimeout(r, 300));
    let alive = true;
    try { process.kill(pid, 0); } catch { alive = false; }
    assert.ok(!alive, 'frpc 进程必须被收割（防孤儿占端口）');
    upstream.close();
  });

  test('cleanup', async () => {
    try { manager?.stop(); } catch { /* 已停 */ }
    try { proxy?.close(); } catch { /* 已关 */ }
    try { frpsProc?.kill('SIGTERM'); } catch { /* 已退 */ }
    await new Promise((r) => setTimeout(r, 200));
    rmSync(work, { recursive: true, force: true });
  });
});
