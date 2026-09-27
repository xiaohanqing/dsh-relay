// dsh-relay 服务编排：本地代理 + relay 隧道客户端 + 状态聚合

import { networkInterfaces } from 'node:os';
import { createRequire } from 'node:module';
import { readFileSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { createRelayProxy } from './proxy.mjs';
import { RelayClient, publicUrlFromServer } from './relay.mjs';

const require = createRequire(import.meta.url);

export function qrDataUrl(text, { width = 220, margin = 1 } = {}) {
  const QRCode = require('qrcode');
  return QRCode.toDataURL(text, { errorCorrectionLevel: 'M', margin, width, type: 'image/png' });
}

// ---- 局域网 IPv4 探测（原创实现）----
const PRIVATE_RE = /^(?:10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|100\.(?:6[4-9]|[7-9]\d|1(?:0\d|1\d|2[0-7]))\.)/;
const PHYSICAL_RE = /^(?:wlan|wi-?fi|wireless|eth|en\d|wlp\d|以太网|有线|无线|本地连接)/i;
const VIRTUAL_RE = /(?:tailscale|zerotier|tun|tap|vpn|virtual|vmware|virtualbox|wsl|docker|vethernet|bridge)/i;

export function selectLanIPv4(interfaces) {
  const cands = [];
  for (const [name, addrs] of Object.entries(interfaces ?? {})) {
    for (const addr of addrs ?? []) {
      if (addr.family !== 'IPv4' || addr.internal) continue;
      const ip = addr.address;
      if (!ip || ip.startsWith('127.') || ip.startsWith('169.254.')) continue;
      let score = 0;
      if (PRIVATE_RE.test(ip)) score += 100;
      if (PHYSICAL_RE.test(name)) score += 20;
      else if (VIRTUAL_RE.test(name)) score -= 50;
      cands.push({ ip, score, order: cands.length });
    }
  }
  cands.sort((a, b) => b.score - a.score || a.order - b.order);
  return cands[0]?.ip ?? null;
}

function allLanCandidates() {
  const ips = [];
  for (const addrs of Object.values(networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (addr.family !== 'IPv4' || addr.internal) continue;
      const ip = addr.address;
      if (ip && !ip.startsWith('127.') && !ip.startsWith('169.254.') && !ips.includes(ip)) ips.push(ip);
    }
  }
  return ips;
}

/**
 * @param {object} opts
 * @param {number} opts.dshPort  DSH web 端口
 * @param {object} [opts.hooks]  测试注入 { createProxy, RelayClient, qrDataUrl, lanIPv4 }
 */
export function createRelayService({
  dshPort,
  port = 3082,
  home,
  hooks = {},
  getLanIpOverride = () => '',
  getLanEnabled = () => true,
  getLanAuthEnabled = () => true,
  getPins = () => ({ public: '', lan: '' }),
  isPinCustom = () => false,
  getRelayConfig = () => ({ url: '', token: '', enabled: false }),
  onRelayReady = () => {},
  /** dsh web 浏览器会话启动 token（实时取，issue 平台契约：GET / 首次需 ?token= 换 cookie） */
  launchToken = () => '',
  log = console,
} = {}) {
  const logInfo = (...a) => (log.info ?? log.log).call(log, ...a);
  const logWarn = (...a) => log.warn?.(...a) ?? console.warn(...a);

  const createProxyFn = hooks.createProxy ?? createRelayProxy;
  const RelayClientCls = hooks.RelayClient ?? RelayClient;
  const qr = hooks.qrDataUrl ?? qrDataUrl;

  let proxy = null;
  let client = null;
  let relayState = { phase: 'idle', detail: '', attempts: 0, nextRetryAt: null, server: null };
  const qrCache = new Map();
  let lanCache = null;
  // 进程级会话密钥：PIN 的登录 cookie 绑定它，DSH 重启后手机需重新输一次密码
  const sessionKey = hooks.sessionKey ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  // 进程重启后自动恢复中继的标记（enabled 状态持久化在 settings，重启后由 index.js 调 startRelay）
  const homeDir = home ?? process.env.DSH_HOME ?? join(homedir(), '.dsh');
  const autoMarkerPath = join(homeDir, 'dsh-relay', 'relay-auto.json');
  function persistAutoMarker() {
    try {
      mkdirSync(dirname(autoMarkerPath), { recursive: true });
      writeFileSync(autoMarkerPath, JSON.stringify({ at: Date.now() }), 'utf8');
    } catch { /* 忽略 */ }
  }
  function clearAutoMarker() {
    try { rmSync(autoMarkerPath, { force: true }); } catch { /* 忽略 */ }
  }

  async function qrCached(text) {
    if (!text) return null;
    if (!qrCache.has(text)) {
      if (qrCache.size >= 8) qrCache.delete(qrCache.keys().next().value);
      qrCache.set(text, qr(text).catch(() => null));
    }
    return qrCache.get(text);
  }

  function lanIp() {
    const override = String(getLanIpOverride() ?? '').trim();
    if (override) return override;
    const now = Date.now();
    if (!lanCache || now - lanCache.at > 15_000) {
      lanCache = { at: now, ip: selectLanIPv4(networkInterfaces()) };
    }
    return lanCache.ip;
  }

  return {
    dshPort,

    /** 启动本地代理（幂等）。端口被占自动 +1 重试。 */
    async startProxy() {
      if (proxy) return proxy;
      let lastErr = null;
      for (let p = port; p < port + 10; p++) {
        try {
          proxy = await createProxyFn({
            port: p,
            host: '0.0.0.0',
            upstream: { host: '127.0.0.1', port: dshPort },
            auth: {
              sessionKey,
              getPin: (kind) => getPins()[kind] ?? '',
              isProtected: (kind) => (kind === 'public' ? true : getLanAuthEnabled()),
            },
            lanAccessEnabled: () => getLanEnabled(),
            launchToken,
          });
          if (p !== port) logInfo(`dsh-relay: port ${port} busy, proxy on ${p} | 端口被占，改用 ${p}`);
          return proxy;
        } catch (err) {
          if (err?.code !== 'EADDRINUSE') throw err;
          lastErr = err;
        }
      }
      throw lastErr ?? new Error('proxy start failed');
    },

    /** 开启 NAS 中继（幂等）。 */
    async startRelay() {
      const cfg = getRelayConfig();
      if (!cfg.url || !cfg.token) {
        throw new Error('请先在设置里填写 NAS 服务端地址和 token | set the relay server address and token first');
      }
      const p = await this.startProxy();
      if (client?.running) return publicUrlFromServer(cfg.url);
      client = new RelayClientCls({
        serverUrl: cfg.url,
        token: cfg.token,
        proxyPort: p.inletPort ?? p.port,
        log: logInfo,
        onChange: (snap) => {
          relayState = snap;
          if (snap.phase === 'ready') onRelayReady();
        },
        ...(hooks.relayHooks ? { hooks: hooks.relayHooks } : {}),
      });
      client.start();
      persistAutoMarker();
      return publicUrlFromServer(cfg.url);
    },

    stopRelay({ keepMarker = false } = {}) {
      client?.stop();
      client = null;
      relayState = { phase: 'idle', detail: '', attempts: 0, nextRetryAt: null, server: null };
      if (!keepMarker) clearAutoMarker();
    },

    /** 重启后自动恢复：上次开着中继就重新拉起。 */
    async restoreRelayIfNeeded() {
      try {
        readFileSync(autoMarkerPath, 'utf8');
      } catch { return false; }
      const cfg = getRelayConfig();
      if (!cfg.url || !cfg.token) return false;
      try {
        await this.startRelay();
        logInfo('dsh-relay: relay auto-restored | 已自动恢复 NAS 中继');
        return true;
      } catch (err) {
        logWarn(`dsh-relay: relay auto-restore failed | 自动恢复失败: ${err?.message ?? err}`);
        return false;
      }
    },

    async status() {
      const p = await this.startProxy();
      const lan = lanIp();
      const lanUrl = lan ? `http://${lan}:${p.port}` : null;
      const cfg = getRelayConfig();
      const publicUrl = client?.running ? publicUrlFromServer(cfg.url) : '';
      return {
        proxyRunning: true,
        proxyPort: p.port,
        dshPort,
        lanUrl,
        lanQr: await qrCached(lanUrl),
        lanCandidates: allLanCandidates(),
        lanIpOverride: String(getLanIpOverride() ?? ''),
        lanAuthEnabled: getLanAuthEnabled(),
        lanEnabled: getLanEnabled(),
        relayRunning: Boolean(client?.running),
        relayUrl: publicUrl || null,
        relayQr: publicUrl ? await qrCached(publicUrl) : null,
        relayState,
        relayConfig: { url: cfg.url, tokenSet: Boolean(cfg.token) },
      };
    },

    async dispose() {
      this.stopRelay({ keepMarker: true });
      if (proxy) {
        const p = proxy;
        proxy = null;
        try { await p.close(); } catch { /* 忽略 */ }
      }
    },
  };
}
