// 隧道模式最坏启动路径验证（与 worst-case.mjs 同源的红线回归）：
//   独立桩进程跑真实插件 apply()，settings 预置 mode=tunnel + custom 命令指向一个
//   「看标记文件行事」的桩隧道客户端：初始标记存在 → 秒退（目标不可达）；
//   t=20s 撤标记 → 下一次有界重启后桩稳定运行；t=32s 重新打标记 → 桩自杀退出。
//   全程监控 RSS 与 spawn 尝试速率。
//   通过标准：RSS 增长 < 30MB；失败期间 spawn 速率 3s 窗口均值 ≤3 次/秒；隧道曾进入 running；无未捕获异常。
//
// 运行：node test-local/worst-case-tunnel.mjs   （退出码 0 = 通过）
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const HOME = join(tmpdir(), 'dsh-relay-worstcase-tunnel-home');
const STUB_DIR = join(tmpdir(), 'dsh-relay-worstcase-tunnel-stub');
const FAIL_MARKER = join(STUB_DIR, 'fail-now');
const ALIVE = join(STUB_DIR, 'alive');
const PROXY_PORT = 13092;
const RATE_WINDOW_MS = 3000;
const RATE_LIMIT_PER_SEC = 3;

// 1. 隔离环境：settings 预置隧道模式（e2e 残留配置 = 事故现场复现）
rmSync(HOME, { recursive: true, force: true });
rmSync(STUB_DIR, { recursive: true, force: true });
mkdirSync(`${HOME}/dsh-relay`, { recursive: true });
mkdirSync(STUB_DIR, { recursive: true });
writeFileSync(`${HOME}/dsh-relay/settings.json`, JSON.stringify({
  mode: 'tunnel',
  tunnel: {
    tool: 'custom',
    binPath: '',
    config: { command: `node ${join(STUB_DIR, 'stub.mjs')} {{port}}` },
  },
}), 'utf8');
writeFileSync(`${HOME}/dsh-relay/relay-auto.json`, JSON.stringify({ at: Date.now() }), 'utf8');
writeFileSync(FAIL_MARKER, '1', 'utf8'); // 初始：目标不可达（桩秒退）

// 桩隧道客户端（模拟 frpc 的行为形态）：看标记文件行事；标记在 → 秒退（隧道不可达）。
// 标记不在 → 周期性尝试【连接】{{port}}（隧道注入口，代理已在监听；真实隧道客户端
// 正是这样把公网流量转发进来的——它连本地端口，而不是监听它）。连上即视为就绪。
const stubSrc = `
import { existsSync } from 'node:fs';
import net from 'node:net';
const MARKER = ${JSON.stringify(FAIL_MARKER)};
if (existsSync(MARKER)) process.exit(1);
const port = Number(process.argv[2] ?? 0);
function tryConnect() {
  if (existsSync(MARKER)) process.exit(1);
  const s = net.connect(port, '127.0.0.1', () => {
    writeFileSync(${JSON.stringify(ALIVE)}, String(Date.now()));
    s.destroy();
  });
  s.on('error', () => {});
  s.setTimeout(1500, () => s.destroy());
}
import { writeFileSync } from 'node:fs';
tryConnect();
const timer = setInterval(tryConnect, 2000);
timer.unref?.();
setInterval(() => { if (existsSync(MARKER)) process.exit(1); }, 1000);
setInterval(() => {}, 1 << 30);
`;
writeFileSync(join(STUB_DIR, 'stub.mjs'), stubSrc, 'utf8');

// 1b. settings.mjs 读 process.env.DSH_HOME——必须在 import 插件源码之前设置
process.env.DSH_HOME = HOME;

// 2. 计数 spawn（真实 spawn，只加计数）
const attemptTimes = [];
let totalAttempts = 0;
let peakRate = 0;
const t0 = Date.now();
let sawRunning = false;
setInterval(() => {
  // 排除启动后前 2 秒的首次启动 burst
  if (Date.now() - t0 > 2000) {
    let peak = 0;
    for (let i = 0; i < attemptTimes.length; i++) {
      let n = 0;
      for (let j = i; j < attemptTimes.length && attemptTimes[j] - attemptTimes[i] < RATE_WINDOW_MS; j++) n++;
      peak = Math.max(peak, n);
    }
    peakRate = Math.max(peakRate, Math.ceil(peak / (RATE_WINDOW_MS / 1000)));
  }
}, 500).unref();

function countingSpawn(bin, args, opts) {
  totalAttempts += 1;
  if (Date.now() - t0 > 2000) attemptTimes.push(Date.now());
  const child = spawn(bin, args, opts);
  child.stderr?.on('data', (d) => process.stderr.write(`[stub-stderr] ${d}`));
  return child;
}

// 3. 桩宿主 ctx（与 worst-case.mjs 同形）
const ctx = {
  logger: () => ({
    info: () => {},
    warn: (msg) => { process.stderr.write(`[host-warn] ${msg}\n`); return true; },
    error: (msg) => { process.stderr.write(`[host-error] ${msg}\n`); return true; },
  }),
  webServer: { port: 3080, register: () => () => {} },
  connection: {
    authenticatedUrl: () => 'http://127.0.0.1:3080/?token=stub',
    isLoopback: true,
  },
  effect: () => {},
};

const { apply } = await import('../src/index.js');
apply(ctx, {}, {
  dshPort: 3080,
  port: PROXY_PORT,
  home: HOME,
  hooks: { tunnelHooks: { spawnImpl: countingSpawn } },
});

// 4. 监控 RSS
const rss0 = process.memoryUsage().rss;
let maxRss = rss0;
setInterval(() => { maxRss = Math.max(maxRss, process.memoryUsage().rss); }, 500).unref();

// 5. t=10s：撤标记（目标恢复——要赶在退避爬到 16s 之前，第 5 次重启 ~t15s 时桩才能成功）；
//    t=30s：重新打标记（桩 1s 内自杀 → 验证退避有界）
// 就绪判定：桩连上注入端口后写 ALIVE 文件（见 stubSrc）。
setTimeout(() => {
  rmSync(FAIL_MARKER, { force: true });
  console.log('[t+10s] target up (marker removed)');
}, 10_000);
setTimeout(() => {
  writeFileSync(FAIL_MARKER, '1', 'utf8'); // 桩 1s 内自杀
  console.log('[t+30s] target down again (marker set)');
}, 30_000);

// 6. t=45s：出结果
setTimeout(async () => {
  sawRunning = existsSync(ALIVE);
  const rssGrowMB = (maxRss - rss0) / 1024 / 1024;
  console.log(`spawn attempts total = ${totalAttempts}, peak window avg (${RATE_WINDOW_MS / 1000}s) = ${peakRate}/sec`);
  console.log(`tunnel reached running: ${sawRunning ? 'yes' : 'NO'}`);
  console.log(`RSS growth = ${rssGrowMB.toFixed(1)} MB (max ${(maxRss / 1024 / 1024).toFixed(0)} MB)`);
  const pass = rssGrowMB < 30 && peakRate <= RATE_LIMIT_PER_SEC && sawRunning;
  console.log(pass ? 'PASS ✓' : 'FAIL ✗');
  rmSync(HOME, { recursive: true, force: true });
  rmSync(STUB_DIR, { recursive: true, force: true });
  process.exit(pass ? 0 : 1);
}, 45_000);

// 兜底：未捕获异常 = 直接 FAIL（不许崩）
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT:', err.message);
  process.exit(1);
});
