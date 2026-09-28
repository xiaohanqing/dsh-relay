// 隧道层单测：适配器纯函数（配置生成/URL推导/命令切分/URL提取）+ TunnelManager 生命周期红线
import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, existsSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { EventEmitter } from 'node:events';

import { buildFrpcToml, derivePublicUrl } from '../src/tunnels/frp.mjs';
import { splitCommand, custom } from '../src/tunnels/custom.mjs';
import { cloudflared } from '../src/tunnels/cloudflared.mjs';
import { natapp } from '../src/tunnels/natapp.mjs';
import { getAdapter, listAdapters } from '../src/tunnels/index.mjs';
import { createTunnelManager } from '../src/tunnel.mjs';

// ---------- frp 配置生成 ----------

describe('frp buildFrpcToml', () => {
  const base = { config: { serverAddr: '1.2.3.4', serverPort: 7000, token: 'secret-token' }, localPort: 3083, adminPort: 17400, logFile: '/tmp/frpc.log' };

  test('tcp 形态：默认字段齐全，localPort 指向注入端口', () => {
    const t = buildFrpcToml({ ...base, config: { ...base.config, proxyType: 'tcp', remotePort: 63082 } });
    assert.match(t, /serverAddr = "1\.2\.3\.4"/);
    assert.match(t, /serverPort = 7000/);
    assert.match(t, /auth\.token = "secret-token"/);
    assert.match(t, /loginFailExit = false/);
    assert.match(t, /transport\.tls\.enable = true/);
    assert.match(t, /type = "tcp"/);
    assert.match(t, /localPort = 3083/);
    assert.match(t, /remotePort = 63082/);
    assert.match(t, /transport\.useEncryption = true/);
    assert.match(t, /webServer\.port = 17400/);
  });

  test('tcp 形态：remotePort 缺省 0（frps 随机分配）', () => {
    const t = buildFrpcToml(base);
    assert.match(t, /remotePort = 0/);
  });

  test('https 形态：带 customDomains', () => {
    const t = buildFrpcToml({ ...base, config: { ...base.config, proxyType: 'https', customDomain: 'dsh.example.com' } });
    assert.match(t, /type = "https"/);
    assert.match(t, /customDomains = \["dsh\.example\.com"\]/);
    assert.doesNotMatch(t, /remotePort/);
  });

  test('http/https 缺域名 → 报错', () => {
    assert.throws(() => buildFrpcToml({ ...base, config: { ...base.config, proxyType: 'https' } }), /域名|domain/);
  });

  test('缺 token → 报错', () => {
    assert.throws(() => buildFrpcToml({ ...base, config: { serverAddr: 'x' } }), /token/);
  });

  test('raw 模式：原样保留并补 admin 口', () => {
    const t = buildFrpcToml({ ...base, config: { rawToml: 'serverAddr = "9.9.9.9"\nauth.token = "t"' } });
    assert.match(t, /serverAddr = "9\.9\.9\.9"/);
    assert.match(t, /webServer\.port = 17400/);
  });

  test('raw 模式：缺 serverAddr → 报错', () => {
    assert.throws(() => buildFrpcToml({ ...base, config: { rawToml: 'auth.token = "t"' } }), /serverAddr/);
  });

  test('tlsDisable 可显式关闭传输层 TLS（老 frps）', () => {
    const t = buildFrpcToml({ ...base, config: { ...base.config, tlsDisable: true } });
    assert.match(t, /transport\.tls\.enable = false/);
  });
});

describe('frp derivePublicUrl', () => {
  test('tcp → http://addr:remotePort', () => {
    assert.equal(derivePublicUrl({ serverAddr: '1.2.3.4', remotePort: 63082, proxyType: 'tcp' }), 'http://1.2.3.4:63082');
  });
  test('tcp 未填 remotePort → 空', () => {
    assert.equal(derivePublicUrl({ serverAddr: '1.2.3.4', proxyType: 'tcp' }), '');
  });
  test('https → https://domain', () => {
    assert.equal(derivePublicUrl({ serverAddr: 'x', proxyType: 'https', customDomain: 'dsh.example.com' }), 'https://dsh.example.com');
  });
  test('raw → 空（动态，无法推导）', () => {
    assert.equal(derivePublicUrl({ rawToml: 'serverAddr = "x"' }), '');
  });
});

// ---------- custom 切分与占位符 ----------

describe('custom splitCommand', () => {
  test('基础切分', () => {
    assert.deepEqual(splitCommand('rathole client.toml'), ['rathole', 'client.toml']);
  });
  test('单双引号与转义', () => {
    assert.deepEqual(splitCommand(`sh -c "echo 'a b'" x\\ y`), ['sh', '-c', "echo 'a b'", 'x y']);
  });
  test('占位符原样保留', () => {
    assert.deepEqual(splitCommand('bore local {{port}} --to bore.pub'), ['bore', 'local', '{{port}}', '--to', 'bore.pub']);
  });
  test('未闭合引号 → 报错', () => {
    assert.throws(() => splitCommand('cmd "abc'), /引号|quote/);
  });

  test('launch：占位符替换 + 配置文件落盘 + args 不含程序名', () => {
    const plan = custom.launch({
      config: { command: 'node /opt/stub.mjs {{port}} --config {{configFile}}', configTemplate: 'local_port = {{port}}' },
      localPort: 3083,
      dir: '/tmp/relay-custom-test',
    });
    assert.deepEqual(plan.args, ['/opt/stub.mjs', '3083', '--config', '/tmp/relay-custom-test/custom-config.txt']);
    assert.equal(plan.files.length, 1);
    assert.equal(plan.files[0].content, 'local_port = 3083');
  });
});

// ---------- URL 提取 ----------

describe('parseLine', () => {
  test('cloudflared quick tunnel', () => {
    const r = cloudflared.parseLine('2026-09-28T10:00:00Z INF +--------------------------------------------------------------------------------------------+');
    assert.equal(r, null);
    assert.deepEqual(
      cloudflared.parseLine('INF |  https://some-random-words-here.trycloudflare.com                       |'),
      { publicUrl: 'https://some-random-words-here.trycloudflare.com' },
    );
  });
  test('natapp 转发表', () => {
    assert.deepEqual(
      natapp.parseLine('web forward   http://x7y8z.natappfree.cc -> 127.0.0.1:3083'),
      { publicUrl: 'http://x7y8z.natappfree.cc' },
    );
  });
});

// ---------- 注册表与二进制定位 ----------

describe('adapter registry / resolveBin', () => {
  test('注册表含 4 个工具且 id 唯一', () => {
    const list = listAdapters();
    assert.equal(list.length, 4);
    assert.equal(new Set(list.map((a) => a.id)).size, 4);
    assert.ok(getAdapter('frp') && getAdapter('custom') && !getAdapter('nope'));
  });

  test('override 路径不存在 → 明确报错原因', () => {
    const r = getAdapter('frp').resolveBin({ binPath: '/no/such/frpc' });
    assert.equal(r.bin, null);
    assert.match(r.reason, /\/no\/such\/frpc/);
  });

  test('PATH 命中 → 返回绝对路径', () => {
    const dir = mkdtempSync(join(tmpdir(), 'relay-bin-'));
    const fake = join(dir, 'frpc');
    writeFileSync(fake, '#!/bin/sh\nexit 0\n');
    chmodSync(fake, 0o755);
    const prev = process.env.PATH;
    process.env.PATH = dir;
    try {
      const r = getAdapter('frp').resolveBin({});
      assert.equal(r.bin, fake);
    } finally {
      process.env.PATH = prev;
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

// ---------- TunnelManager 生命周期（红线回归） ----------

describe('TunnelManager', () => {
  let HOME;

  function fakeChild() {
    const c = new EventEmitter();
    c.pid = 100000 + Math.floor(Math.random() * 899999);
    c.stdout = new EventEmitter();
    c.stderr = new EventEmitter();
    c.kill = () => {};
    return c;
  }

  /** 可复用的 spawn mock：默认 spawn 后异步 exit(0)；传 exitCode=null 则不自动退出。 */
  function makeSpawnMock(spawned, { exitCode = 0 } = {}) {
    return (bin, args) => {
      const c = fakeChild();
      spawned.push({ c, bin, args });
      if (exitCode !== null) queueMicrotask(() => c.emit('exit', exitCode, null));
      return c;
    };
  }

  function fakeBinDir() {
    const dir = mkdtempSync(join(tmpdir(), 'relay-fake-bin-'));
    const bin = join(dir, 'fake-tunnel');
    writeFileSync(bin, '#!/bin/sh\nexit 0\n');
    chmodSync(bin, 0o755);
    return { dir, bin };
  }

  beforeEach(() => {
    HOME = mkdtempSync(join(tmpdir(), 'relay-tunnel-mgr-'));
  });

  afterEach(() => {
    rmSync(HOME, { recursive: true, force: true });
  });

  function makeManager(hooks = {}, onChange = () => {}) {
    return createTunnelManager({
      home: HOME,
      localPort: 3083,
      onChange,
      log: { info: () => {}, warn: () => {} },
      hooks: { killGraceMs: 30, ...hooks },
    });
  }

  test('缺二进制 → error 态，不 spawn、不重试', async () => {
    const spawned = [];
    const m = makeManager({ spawnImpl: makeSpawnMock(spawned) });
    await assert.rejects(
      () => m.start({ tool: 'frp', config: { binPath: '/no/such/frpc', serverAddr: 'x', token: 'y' } }),
      /\/no\/such\/frpc/,
    );
    assert.equal(m.snapshot().phase, 'error');
    assert.equal(spawned.length, 0);
  });

  test('custom 缺命令 → error 态', async () => {
    const m = makeManager({});
    await assert.rejects(() => m.start({ tool: 'custom', config: {} }), /command/);
    assert.equal(m.snapshot().phase, 'error');
  });

  test('正常启动：spawn 一次、frpc.toml 落盘 0600、含注入端口、verify 先行', async () => {
    const { dir, bin } = fakeBinDir();
    const spawned = [];
    const calls = [];
    const spawnImpl = (b, args) => {
      calls.push([b, args]);
      const c = fakeChild();
      if (args[0] === 'verify') queueMicrotask(() => c.emit('exit', 0, null)); // verify 通过
      else spawned.push(c);
      return c;
    };
    const m = makeManager({ spawnImpl });
    const s = await m.start({ tool: 'frp', config: { binPath: bin, serverAddr: '1.2.3.4', token: 'tok-123456', remotePort: 63082 } });
    assert.equal(s.phase, 'running');
    assert.equal(calls[0][1][0], 'verify', 'frp 必须先 verify 再 spawn');
    assert.equal(spawned.length, 1);
    const tomlPath = join(HOME, 'dsh-relay', 'tunnel', 'frp', 'frpc.toml');
    assert.ok(existsSync(tomlPath));
    const toml = readFileSync(tomlPath, 'utf8');
    assert.match(toml, /localPort = 3083/);
    assert.match(toml, /auth\.token = "tok-123456"/);
    m.stop();
    rmSync(dir, { recursive: true, force: true });
  });

  test('verify 失败 → error 态且不 spawn 主进程、不自动重试', async () => {
    const { bin } = fakeBinDir();
    const spawned = [];
    const spawnImpl = (b, args) => {
      const c = fakeChild();
      if (args[0] === 'verify') queueMicrotask(() => c.emit('exit', 1, null)); // verify 失败
      else spawned.push(c);
      return c;
    };
    const m = makeManager({ spawnImpl });
    await m.start({ tool: 'frp', config: { binPath: bin, rawToml: 'serverAddr = "x"' } });
    const s = m.snapshot();
    assert.equal(s.phase, 'error');
    assert.match(s.detail, /verify/);
    assert.equal(spawned.length, 0);
    m.stop();
    void bin;
  });

  test('once 守卫：exit+error 双触发只调度一次重启，退避后只补一次 spawn', async () => {
    const spawned = [];
    const spawnImpl = () => {
      const c = fakeChild();
      spawned.push(c);
      queueMicrotask(() => { c.emit('exit', 1, null); c.emit('error', new Error('boom')); });
      return c;
    };
    const m = makeManager({ spawnImpl });
    await m.start({ tool: 'custom', config: { command: '/bin/true' } });
    const s = m.snapshot();
    assert.equal(s.phase, 'backoff');
    assert.equal(s.attempts, 1, 'exit+error 双触发只能计一次');
    await new Promise((r) => setTimeout(r, 1600)); // 等第一期退避（1s±20%）
    assert.equal(spawned.length, 2, `expected exactly 2 spawns, got ${spawned.length}`);
    m.stop();
  });

  test('退避计数随连续失败递增，重启延时不超过 60s 封顶', async () => {
    const snaps = [];
    const m = makeManager({ spawnImpl: makeSpawnMock([]) }, (s) => snaps.push(s));
    await m.start({ tool: 'custom', config: { command: '/bin/false' } });
    // 直驱 _start（模拟退避定时器到期），连续失败 8 轮
    for (let i = 0; i < 8; i++) {
      await m._start();
      await new Promise((r) => setTimeout(r, 0)); // 让 microtask 的 exit 落地
    }
    const backoffs = snaps.filter((s) => s.phase === 'backoff');
    assert.ok(backoffs.length >= 8, `expected >=8 backoff snapshots, got ${backoffs.length}`);
    const delays = backoffs.map((s) => s.nextRetryAt - Date.now());
    assert.ok(backoffs[backoffs.length - 1].attempts >= 8, '退避计数必须递增');
    for (const d of delays) assert.ok(d <= 61_000, `backoff ${d}ms 超过封顶`);
    m.stop();
  });

  test('稳定运行≥60s 后退出 → 退避计数复位（nowImpl 注入）', async () => {
    let now = Date.now();
    const spawned = [];
    const m = makeManager({ nowImpl: () => now, spawnImpl: makeSpawnMock(spawned, { exitCode: null }) });
    await m.start({ tool: 'custom', config: { command: '/bin/true' } });
    assert.equal(m.snapshot().attempts, 0);
    now += 61_000; // 稳定运行 61s
    spawned[0].c.emit('exit', 0, null);
    assert.equal(m.snapshot().attempts, 1, '退避应从 1 重新起算（已复位）');
    m.stop();
  });

  test('stop()：SIGTERM 进程组，宽限期后 SIGKILL', async () => {
    const spawned = [];
    const kills = [];
    const m = makeManager({ spawnImpl: makeSpawnMock(spawned, { exitCode: null }), killImpl: (pid, sig) => kills.push([pid, sig]) });
    await m.start({ tool: 'custom', config: { command: '/bin/sleep 100' } });
    const pid = spawned[0].c.pid;
    m.stop();
    assert.deepEqual(kills.filter(([, x]) => x === 'SIGTERM'), [[pid, 'SIGTERM']]);
    assert.equal(m.snapshot().phase, 'idle');
    await new Promise((r) => setTimeout(r, 80));
    assert.deepEqual(kills.filter(([, x]) => x === 'SIGKILL'), [[pid, 'SIGKILL']], '宽限期后必须 SIGKILL');
  });

  test('stop 后退出不触发重启（stopped 守卫）', async () => {
    const spawned = [];
    const m = makeManager({ spawnImpl: makeSpawnMock(spawned, { exitCode: null }) });
    await m.start({ tool: 'custom', config: { command: '/bin/true' } });
    m.stop();
    const n = spawned.length;
    spawned[0].c.emit('exit', 0, null);
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(spawned.length, n, 'stop 后不允许再 spawn');
  });

  test('公网 URL 从输出提取（cloudflared quick，binPath 指向 fake bin）', async () => {
    const { dir, bin } = fakeBinDir();
    const spawned = [];
    const m = makeManager({ spawnImpl: makeSpawnMock(spawned, { exitCode: null }) });
    await m.start({ tool: 'cloudflared', config: { binPath: bin } });
    spawned[0].c.stdout.emit('data', 'INF |  https://test-tunnel-url.trycloudflare.com  |\n');
    assert.equal(m.snapshot().publicUrl, 'https://test-tunnel-url.trycloudflare.com');
    m.stop();
    rmSync(dir, { recursive: true, force: true });
  });

  test('幂等：同配置重复 start 不重复 spawn；换配置触发干净重启', async () => {
    const spawned = [];
    const kills = [];
    const m = makeManager({ spawnImpl: makeSpawnMock(spawned, { exitCode: null }), killImpl: (pid, sig) => kills.push([pid, sig]) });
    const cfg = { tool: 'custom', config: { command: '/bin/sleep 100' } };
    await m.start(cfg);
    await m.start(cfg);
    await m.start(cfg);
    assert.equal(spawned.length, 1, '同配置幂等');
    await m.start({ tool: 'custom', config: { command: '/bin/sleep 200' } });
    assert.equal(spawned.length, 2, '换配置必须重启');
    assert.ok(kills.some(([, sig]) => sig === 'SIGTERM'), '旧进程必须被收割');
    m.stop();
  });
});
