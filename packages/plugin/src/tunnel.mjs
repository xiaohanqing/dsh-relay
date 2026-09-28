// 外接隧道守护（TunnelManager）：spawn 隧道工具子进程 + 崩溃有界重启 + 状态聚合
//
// 【绝对红线】（2026-09-27 relay OOM 事故同源教训，五条缺一不可）：
//   1. 子进程的 exit 与 error 事件可能各触发一次 —— 处理必须 once 守卫，一次退出只调度一次重启；
//   2. 重启退避计数挂在 manager 级（不随新进程对象重置），且连续稳定运行 ≥60s 才复位；
//   3. 同一时刻最多 1 个子进程（state machine 保证），杜绝 spawn 风暴；
//   4. stop() 收割进程组（SIGTERM → 5s 宽限 → SIGKILL），防孤儿占端口；DSH dispose 时同样走这里；
//   5. 日志只留环形缓冲最近 50 行，绝不无界累积。
// 另：配置类错误（verify 失败、二进制缺失、必填项缺失）进入 error 态且【不自动重试】——
// 配置不会自己变好，重试只会刷屏；用户改完配置重新 start。

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getAdapter, listAdapters } from './tunnels/index.mjs';
import { freeLoopbackPort } from './tunnels/resolve-bin.mjs';

const BACKOFF_BASE_MS = 1_000;
const BACKOFF_CAP_MS = 60_000;
const STABLE_RESET_MS = 60_000; // 连续稳定运行超此时长，退避计数才复位
const KILL_GRACE_MS_DEFAULT = 5_000;
const LOG_LINES_MAX = 50;

/** 指数退避：1s×2^(n-1)，±20% 抖动后硬封顶 60s（UI 倒计时/断言都以 60s 为界）。 */
function backoffMs(attempt) {
  const raw = Math.min(BACKOFF_BASE_MS * 2 ** Math.max(0, attempt - 1), BACKOFF_CAP_MS);
  return Math.min(Math.floor(raw * (0.8 + Math.random() * 0.4)), BACKOFF_CAP_MS);
}

/**
 * @param {object} opts
 * @param {string} opts.home      DSH_HOME（工作目录 <home>/dsh-relay/tunnel/<tool>/）
 * @param {number} opts.localPort 稳定隧道注入口端口（适配器的转发目标）
 * @param {(snap:object)=>void} [opts.onChange]
 * @param {object} [opts.log]     logger（info/warn）
 * @param {object} [opts.hooks]   测试注入 { spawnImpl, killImpl, nowImpl, freePortImpl }
 */
export function createTunnelManager({ home, localPort, onChange = () => {}, log = () => {}, hooks = {} }) {
  const spawnImpl = hooks.spawnImpl ?? spawn;
  const killImpl = hooks.killImpl ?? defaultKill;
  const nowImpl = hooks.nowImpl ?? Date.now;
  const freePortImpl = hooks.freePortImpl ?? freeLoopbackPort;
  const killGraceMs = hooks.killGraceMs ?? KILL_GRACE_MS_DEFAULT;
  const logInfo = (...a) => (log.info ?? log.log).call(log, ...a);
  const logWarn = (...a) => {
    // 不要写 `log.warn?.(...a) ?? console.warn(...a)`：标准 logger.warn 返回 undefined，
    // 会触发 console 兜底导致每条警告双打（service.mjs 同款修复）。
    if (typeof log.warn === 'function') log.warn(...a);
    else console.warn(...a);
  };

  function defaultKill(pid, sig) {
    // detached 子进程有自己的进程组：-pid 杀全组（Windows 无进程组语义，走 child.kill 兜底）
    try { process.kill(-pid, sig); } catch { /* 组已不存在 */ }
  }

  let stopped = true;
  let adapter = null;
  let cfg = null; // { tool, config }
  let bin = '';
  let child = null;
  let attempt = 0;
  let startedAt = 0;
  let retryTimer = null;
  let killTimer = null;
  let exiting = false; // once 守卫：exit 与 error 只处理一次
  let outBuf = '';
  const logs = [];

  let snap = {
    phase: 'idle', // idle | starting | running | backoff | error
    tool: '',
    detail: '',
    publicUrl: '',
    attempts: 0,
    nextRetryAt: null,
    pid: null,
    binPath: '',
    logs: [],
  };

  function emit(patch) {
    snap = { ...snap, ...patch, logs: logs.slice(-8) };
    onChange({ ...snap });
  }

  function pushLog(line) {
    const t = String(line ?? '').replace(/\s+$/, '');
    if (!t) return;
    logs.push(t);
    if (logs.length > LOG_LINES_MAX) logs.shift();
    const found = adapter?.parseLine?.(t);
    if (found?.publicUrl && found.publicUrl !== snap.publicUrl) {
      emit({ publicUrl: found.publicUrl, detail: `已获取公网地址 ${found.publicUrl}` });
      logInfo(`dsh-relay: tunnel public url ${found.publicUrl}`);
    }
  }

  function onOutput(chunk) {
    outBuf += chunk;
    let idx;
    while ((idx = outBuf.indexOf('\n')) >= 0) {
      pushLog(outBuf.slice(0, idx));
      outBuf = outBuf.slice(idx + 1);
    }
    if (outBuf.length > 16 * 1024) { pushLog(outBuf); outBuf = ''; } // 超长无换行防御
  }

  /** 进程退出（exit/error 汇聚点，once 守卫）。 */
  function handleExit(why) {
    if (exiting) return;
    exiting = true;
    const c = child;
    child = null;
    if (killTimer) { clearTimeout(killTimer); killTimer = null; }
    if (stopped) { emit({ phase: 'idle', pid: null, detail: '' }); return; }
    // 红线 #2：稳定运行足够久才算成功，才复位退避计数
    if (nowImpl() - startedAt >= STABLE_RESET_MS) attempt = 0;
    attempt += 1;
    const delay = backoffMs(attempt);
    const nextAt = nowImpl() + delay;
    const secs = Math.round(delay / 1000);
    emit({
      phase: 'backoff',
      pid: null,
      detail: `进程退出（${why}），${secs}s 后第 ${attempt} 次重启 | exited (${why}); restart #${attempt} in ${secs}s`,
      attempts: attempt,
      nextRetryAt: nextAt,
    });
    logWarn(`dsh-relay: tunnel process exited (${why}); retry in ${delay}ms`);
    retryTimer = setTimeout(() => { retryTimer = null; void _start(); }, delay);
    retryTimer.unref?.();
  }

  async function _start() {
    if (stopped) return;
    if (child) return; // 防御：绝不双重 spawn（红线 #3）
    exiting = false;
    outBuf = '';
    const dir = join(home, 'dsh-relay', 'tunnel', cfg.tool);
    try { mkdirSync(dir, { recursive: true }); } catch (err) {
      stopped = true;
      emit({ phase: 'error', detail: `无法创建隧道工作目录：${err.message}` });
      return;
    }
    const adminPort = adapter.wantsAdminPort ? await freePortImpl().catch(() => 0) : 0;
    let plan;
    try {
      plan = adapter.launch({ config: cfg.config, bin, localPort, dir, adminPort });
    } catch (err) {
      // 配置类错误：不自动重试（配置不会自己变好），交给用户修
      stopped = true;
      emit({ phase: 'error', detail: err.message });
      return;
    }
    for (const f of plan.files ?? []) {
      try { writeFileSync(f.path, f.content, { mode: 0o600 }); } catch (err) {
        stopped = true;
        emit({ phase: 'error', detail: `无法写入配置文件 ${f.path}：${err.message}` });
        return;
      }
    }
    if (typeof adapter.verify === 'function') {
      const v = await adapter.verify({ bin, files: plan.files, spawnImpl });
      if (v?.note) logInfo(`dsh-relay: ${v.note}`);
      if (v && v.ok === false) {
        stopped = true; // 配置类错误：不自动重试
        emit({ phase: 'error', detail: v.detail ?? '配置校验失败 | config verification failed' });
        return;
      }
    }
    startedAt = nowImpl();
    let p;
    try {
      p = spawnImpl(bin, plan.args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        ...(plan.env ? { env: { ...process.env, ...plan.env } } : {}),
        detached: process.platform !== 'win32',
        windowsHide: true,
      });
    } catch (err) {
      handleExit(`spawn: ${err.message}`); // 走退避（二进制可能暂时不可执行）
      return;
    }
    child = p;
    emit({
      phase: 'running',
      pid: p.pid,
      publicUrl: adapter.derivePublicUrl?.(cfg.config) || snap.publicUrl || '',
      detail: adapter.derivePublicUrl?.(cfg.config)
        ? `已启动 ${cfg.tool}`
        : '已启动，等待公网地址… | started, waiting for public url…',
      binPath: bin,
    });
    logInfo(`dsh-relay: tunnel ${cfg.tool} started (pid ${p.pid})`);
    p.stdout?.setEncoding?.('utf8');
    p.stderr?.setEncoding?.('utf8');
    p.stdout?.on('data', onOutput);
    p.stderr?.on('data', onOutput);
    p.on('exit', (code, signal) => handleExit(signal ? `signal ${signal}` : `code ${code}`));
    p.on('error', (err) => handleExit(err.message));
  }

  return {
    /**
     * 启动（幂等：同配置且在跑则直接返回）。配置错误会抛出（含未找到二进制）。
     * @param {{tool:string, binPath?:string, config?:object}} next
     */
    async start(next) {
      const ad = getAdapter(next?.tool);
      if (!ad) throw new Error(`未知隧道工具 | unknown tunnel tool: ${next?.tool}`);
      const nextKey = JSON.stringify([next.tool, next.binPath ?? '', next.config ?? {}]);
      if (!stopped && child && adapter === ad && nextKey === this._cfgKey) return this.snapshot();
      this.stop(); // 换工具/换配置 → 干净重启
      stopped = false;
      adapter = ad;
      cfg = { tool: next.tool, config: next.config ?? {} };
      this._cfgKey = nextKey;
      attempt = 0;
      logs.length = 0;
      emit({ phase: 'starting', tool: next.tool, detail: '定位程序并准备配置… | resolving binary…', publicUrl: '', attempts: 0, nextRetryAt: null, pid: null });
      const rb = ad.resolveBin(cfg.config);
      if (!rb.bin) {
        stopped = true; // 二进制缺失：配置类错误，不重试
        emit({ phase: 'error', detail: rb.reason, binPath: '' });
        throw new Error(rb.reason);
      }
      bin = rb.bin;
      emit({ binPath: bin });
      await this._start();
      return this.snapshot();
    },
    _start,

    /** 停止并收割进程组。 */
    stop() {
      stopped = true;
      if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
      const c = child;
      child = null;
      if (c) {
        const pid = c.pid;
        try { killImpl(pid, 'SIGTERM'); } catch { try { c.kill('SIGTERM'); } catch { /* 已退出 */ } }
        if (killTimer) clearTimeout(killTimer);
        killTimer = setTimeout(() => {
          killTimer = null;
          try { killImpl(pid, 'SIGKILL'); } catch { try { c.kill('SIGKILL'); } catch { /* 已退出 */ } }
        }, killGraceMs);
        killTimer.unref?.();
      }
      emit({ phase: 'idle', pid: null, detail: '', publicUrl: '', attempts: 0, nextRetryAt: null });
    },

    dispose() { this.stop(); },

    /** 探测各工具在本机的可用性（设置页工具选择用）。 */
    detect(currentConfig = {}) {
      return listAdapters().map((a) => {
        const binPath = a.id === currentConfig.tool ? String(currentConfig.binPath ?? '') : '';
        let r;
        try { r = a.resolveBin({ ...currentConfig.config, binPath }); } catch { r = { bin: null, reason: 'detect failed' }; }
        return {
          id: a.id,
          label: a.label,
          available: Boolean(r.bin),
          binPath: r.bin ?? '',
          reason: r.bin ? '' : (r.reason ?? 'not found'),
          docs: a.docs,
        };
      });
    },

    snapshot() { return { ...snap, logs: [...snap.logs] }; },
    get running() { return !stopped && Boolean(child); },
    _cfgKey: '',
  };
}
