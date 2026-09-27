// dsh-relay 插件入口：手机/外网经你自己的 NAS 访问 DSH
//
// 设置一级入口「DSH Relay」：
//   - 局域网二维码（代理随插件启动，开箱即用）
//   - NAS 中继（填服务端地址 + token → 手机任意网络可访问，断线自动重连）
//
// 访问密码：8 位 PIN，公网/局域网分开，存 $DSH_HOME/dsh-relay/（0600）。

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { randomInt } from 'node:crypto';

import { createRelayService } from './service.mjs';
import { installRpc } from './rpc.mjs';
import {
  lanEnabled, setLanEnabled, lanAuthEnabled, setLanAuthEnabled,
  lanIpOverride, setLanIpOverride, pinCustom, setPinCustom,
  relayEnabled, setRelayEnabled, relayUrl, setRelayUrl, relayToken, setRelayToken,
  resetSettings, proxyPort,
} from './settings.mjs';

const name = 'dsh-relay';
const inject = ['connection', 'webServer'];

// ---------- 访问密码存储 ----------
const PIN_RE = /^[a-zA-Z0-9]{8}$/;

function homeDir() {
  return process.env.DSH_HOME ?? join(homedir(), '.dsh');
}

function pinPath(kind) {
  return join(homeDir(), 'dsh-relay', kind === 'public' ? 'token' : 'token-lan');
}

function readPin(kind) {
  try {
    const v = readFileSync(pinPath(kind), 'utf8').trim();
    if (PIN_RE.test(v)) return v;
  } catch { /* 无文件 */ }
  return null;
}

function writePin(kind, value) {
  try {
    mkdirSync(dirname(pinPath(kind)), { recursive: true });
    writeFileSync(pinPath(kind), value, { mode: 0o600 });
  } catch { /* 忽略 */ }
  return value;
}

function getPin(kind) {
  return readPin(kind) ?? writePin(kind, String(randomInt(10_000_000, 100_000_000)));
}

function setCustomPin(kind, value) {
  const v = String(value ?? '').trim();
  if (!PIN_RE.test(v)) throw new Error('密码必须是 8 位英文字母或数字 | PIN must be exactly 8 letters/digits');
  writePin(kind, v);
  setPinCustom(kind, true);
  return v;
}

function resetPins() {
  writePin('public', String(randomInt(10_000_000, 100_000_000)));
  writePin('lan', String(randomInt(10_000_000, 100_000_000)));
  setPinCustom('public', false);
  setPinCustom('lan', false);
  return { public: getPin('public'), lan: getPin('lan') };
}

// ---------- 插件 apply ----------

export function apply(ctx, config = {}, internals = {}) {
  const logger = ctx.logger?.(name) ?? console;
  const dshPort = internals.dshPort ?? ctx.webServer?.port;
  if (!dshPort) {
    logger.error('dsh-relay: webServer port unavailable | 拿不到 dsh web 端口，插件无法工作');
    return () => {};
  }

  const service = internals.service ?? createRelayService({
    dshPort,
    port: internals.port ?? config.port ?? (proxyPort() || 3082),
    home: internals.home,
    hooks: internals.hooks ?? {},
    getLanIpOverride: () => lanIpOverride(),
    getLanEnabled: () => lanEnabled(),
    getLanAuthEnabled: () => lanAuthEnabled(),
    getPins: () => ({ public: getPin('public'), lan: getPin('lan') }),
    isPinCustom: (kind) => pinCustom(kind),
    getRelayConfig: () => ({ url: relayUrl(), token: relayToken(), enabled: relayEnabled() }),
    saveRelayConfig: async ({ url, token }) => {
      if (url !== undefined && url !== '') setRelayUrl(url);
      if (token !== undefined && token !== '') setRelayToken(token);
      setRelayEnabled(true);
    },
    pluginVersion: (() => {
      try { return JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version; } catch { return ''; }
    })(),
    onRelayReady: () => {
      logger.info('dsh-relay: relay ready | NAS 中继已就绪');
    },
    // dsh web 浏览器会话启动 token：新版 dsh 要求根路径带一次 ?token= 换会话 cookie。
    // token 每次进程启动都变，必须实时从 connection 服务取（方法形式调用，勿丢 this）。
    launchToken: internals.launchToken ?? (() => {
      try {
        const fn = ctx.connection?.authenticatedUrl;
        if (typeof fn !== 'function') return '';
        const url = new URL(fn.call(ctx.connection, `http://127.0.0.1:${dshPort}`));
        return url.searchParams.get('token') ?? '';
      } catch {
        return '';
      }
    }),
    log: logger,
  });

  // RPC 端点
  const handler = async (endpoint, payload) => {
    const statusPayload = async () => {
      const s = await service.status();
      return ok({
        ...s,
        accessToken: getPin('public'),
        lanToken: getPin('lan'),
        publicPinCustom: pinCustom('public'),
        lanPinCustom: pinCustom('lan'),
      });
    };

    switch (endpoint) {
      case 'relay.status':
        return await statusPayload();

      case 'relay.start': {
        if (payload?.confirm !== true) {
          return fail('开启前请确认安全提示 | please confirm the security notice first');
        }
        try {
          await service.startRelay();
          setRelayEnabled(true);
        } catch (err) {
          return fail(err?.message ?? String(err));
        }
        return await statusPayload();
      }

      case 'relay.stop':
        service.stopRelay();
        setRelayEnabled(false);
        return await statusPayload();

      case 'relay.setConfig': {
        try {
          if (payload?.url !== undefined) setRelayUrl(payload.url);
          if (payload?.token !== undefined && payload.token !== '') setRelayToken(payload.token);
        } catch (err) {
          return fail(err?.message ?? String(err));
        }
        return await statusPayload();
      }

      case 'relay.enroll': {
        const url = String(payload?.url ?? '').trim();
        if (!url) return fail('请填写服务端地址 | server address required');
        try { void service.enroll(url, String(payload?.code ?? '')); } catch (err) { return fail(err?.message ?? String(err)); }
        return await statusPayload();
      }

      case 'relay.enroll.cancel':
        service.enrollCancel();
        return await statusPayload();

      case 'lan.setEnabled':
        setLanEnabled(payload?.on === true);
        return await statusPayload();

      case 'lanAuth.setEnabled':
        setLanAuthEnabled(payload?.on === true);
        return await statusPayload();

      case 'lan.setOverride':
        try { setLanIpOverride(payload?.ip ?? ''); } catch (err) { return fail(err?.message ?? String(err)); }
        return await statusPayload();

      case 'pin.setCustom': {
        const which = payload?.which === 'public' || payload?.which === 'lan' ? payload.which : null;
        if (!which) return fail('未知密码类型 | unknown PIN kind');
        try { setCustomPin(which, payload?.value); } catch (err) { return fail(err?.message ?? String(err)); }
        return await statusPayload();
      }

      case 'relay.reset': {
        if (payload?.confirm !== true) return fail('恢复出厂需要确认 | reset requires confirmation');
        service.stopRelay();
        resetSettings();
        const pins = resetPins();
        return ok({ ...(await service.status()), accessToken: pins.public, lanToken: pins.lan });
      }

      default:
        return fail(`Unknown endpoint: ${endpoint}`);
    }
  };

  function fail(message) {
    return { ok: false, error: { code: 'bad-request', message, details: { issues: [{ message }] } } };
  }
  function ok(value) { return { ok: true, value }; }

  const disposeRpc = installRpc(ctx, { channel: '/dsh-relay', handler, log: logger });

  // 代理随插件启动；上次开着中继则自动恢复
  void service.startProxy()
    .then((p) => {
      logger.info('dsh-relay: proxy ready on :%d | 本地代理已就绪', p.port);
      return service.restoreRelayIfNeeded();
    })
    .catch((err) => {
      logger.error('dsh-relay: proxy start failed | 代理启动失败: %s', err?.message ?? err);
    });

  ctx.effect(() => async () => {
    try { disposeRpc?.(); } catch { /* 忽略 */ }
    await service.dispose();
  }, 'dsh-relay: stop proxy and relay');
}

export { name, inject };
