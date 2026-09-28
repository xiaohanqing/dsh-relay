// 最坏启动路径验证（2026-09-27 OOM 事故回归测试）：
//   独立桩进程跑真实插件 apply()，自动恢复指向"目标不可达"的中继，
//   中途把目标拉起来再杀掉，全程监控 RSS 与连接尝试速率。
//   通过标准：RSS 增长 < 30MB；连接尝试速率有退避（≤3 次/秒）；无未捕获异常。
//
// 运行：node test-local/worst-case.mjs   （退出码 0 = 通过）
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import net from 'node:net';

const HOME = '/tmp/dsh-relay-worstcase-home';
const DEAD_PORT = 15999;
const PROXY_PORT = 13092;

// 1. 隔离 DSH_HOME：e2e 残留配置 = 事故现场复现（relayEnabled: true → 目标不可达）
rmSync(HOME, { recursive: true, force: true });
mkdirSync(`${HOME}/dsh-relay`, { recursive: true });
writeFileSync(`${HOME}/dsh-relay/settings.json`, JSON.stringify({
  relayEnabled: true,
  relayUrl: `ws://127.0.0.1:${DEAD_PORT}`,
  relayToken: 'worst-case-token-0123456789abcdef',
}), 'utf8');
writeFileSync(`${HOME}/dsh-relay/relay-auto.json`, JSON.stringify({ at: Date.now() }), 'utf8');

// 1b. 关键：settings.mjs 读 process.env.DSH_HOME（不是注入的 home 参数）——
// 必须在 import 插件源码之前设置，否则桩配置被短路、测试测了个寂寞（假绿）
process.env.DSH_HOME = HOME;

// 2. 计数 WebSocket：统计连接尝试速率
// 指标用 3 秒滑动窗口平均而不是单秒峰值：退避封顶后 8 条池连接按 +0/0.7/1.4/2.1/2.8s
// 轮转散布，单秒桶天然在 3~4 之间抖动（桶边界毛刺）；持续风暴（无退避全速重连）则
// 任何窗口都会远超阈值。窗口平均既容忍毛刺，又照样抓住风暴。
let attempts = 0;
const attemptTimes = []; // 目标不可达期间的尝试时间戳（滑动窗口原料）
const RATE_WINDOW_MS = 3000;
const RATE_LIMIT_PER_SEC = 3;
let maxAttemptsPerSecondDown = 0; // 窗口平均的峰值（展示用）
let targetUp = false;
const t0 = Date.now();
function peakWindowRate() {
  let peak = 0;
  for (let i = 0; i < attemptTimes.length; i++) {
    // 以第 i 条尝试为窗口起点，统计 3s 窗口内的条数
    let n = 0;
    for (let j = i; j < attemptTimes.length && attemptTimes[j] - attemptTimes[i] < RATE_WINDOW_MS; j++) n++;
    peak = Math.max(peak, n);
  }
  return peak;
}
setInterval(() => {
  // 排除启动后前 2 秒：start() 的初始池建立（ctl+8 条）是预期的一次性 burst
  if (!targetUp && Date.now() - t0 > 2000) {
    const peak = peakWindowRate();
    maxAttemptsPerSecondDown = Math.max(maxAttemptsPerSecondDown, Math.ceil(peak / (RATE_WINDOW_MS / 1000)));
  } else if (targetUp) {
    attemptTimes.length = 0;
  }
}, 500).unref();

class CountingWS {
  constructor(url, opts) {
    attempts++;
    if (!targetUp && Date.now() - t0 > 2000) attemptTimes.push(Date.now());
    return new (globalThis.__RealWS)(url, opts);
  }
  static get OPEN() { return globalThis.__RealWS.OPEN; }
}

// 3. 桩宿主 ctx（模拟 inject 守卫之外的合法形状）
const ctx = {
  logger: () => ({ info: () => {}, warn: () => {}, error: (msg) => process.stderr.write(`[host-error] ${msg}\n`) }),
  webServer: { port: 3080, register: () => () => {} },
  connection: {
    authenticatedUrl: () => 'http://127.0.0.1:3080/?token=stub',
    isLoopback: true,
  },
  effect: () => {},
};

const { apply } = await import('../src/index.js');
const realWS = (await import('ws')).default;
globalThis.__RealWS = realWS;

apply(ctx, {}, {
  dshPort: 3080,
  port: PROXY_PORT,
  home: HOME,
  hooks: { relayHooks: { WebSocket: CountingWS } },
});

// 4. 监控 RSS
const rss0 = process.memoryUsage().rss;
let maxRss = rss0;
setInterval(() => {
  maxRss = Math.max(maxRss, process.memoryUsage().rss);
}, 500).unref();

// 5. t=20s：把目标服务端拉起来（验证自动重连恢复）；t=32s：再杀掉（验证风暴有界）
const { createRelayServer } = await import('../../server/src/server.mjs');
let relay = null;
const upTimer = setTimeout(async () => {
  relay = createRelayServer({ port: DEAD_PORT, host: '127.0.0.1', token: 'worst-case-token-0123456789abcdef' });
  await relay.listen();
  targetUp = true;
  console.log(`[t+20s] target up`);
}, 20_000);
const downTimer = setTimeout(() => {
  relay?.close();
  relay = null;
  targetUp = false;
  console.log(`[t+32s] target down again`);
}, 32_000);

// 6. t=45s：出结果
setTimeout(async () => {
  const rssGrowMB = (maxRss - rss0) / 1024 / 1024;
  console.log(`attempts total = ${attempts}, peak window avg (${RATE_WINDOW_MS / 1000}s) while target down = ${maxAttemptsPerSecondDown}/sec`);
  console.log(`RSS growth = ${rssGrowMB.toFixed(1)} MB (max ${(maxRss / 1024 / 1024).toFixed(0)} MB)`);
  const pass = rssGrowMB < 30 && maxAttemptsPerSecondDown <= RATE_LIMIT_PER_SEC;
  console.log(pass ? 'PASS ✓' : 'FAIL ✗');
  if (relay) await relay.close();
  rmSync(HOME, { recursive: true, force: true });
  process.exit(pass ? 0 : 1);
}, 45_000);

// 兜底：未捕获异常 = 直接 FAIL（不许崩）
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT:', err.message);
  process.exit(1);
});
