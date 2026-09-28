// dsh-relay 设置持久化（$DSH_HOME/dsh-relay/settings.json，0600）

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { isValidIpv4 } from './ip.mjs';

const SETTINGS_REL = join('dsh-relay', 'settings.json');

export function settingsPath() {
  return join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), SETTINGS_REL);
}

function read() {
  try {
    const raw = JSON.parse(readFileSync(settingsPath(), 'utf8'));
    return raw && typeof raw === 'object' ? raw : {};
  } catch { return {}; }
}

function write(s) {
  try {
    mkdirSync(dirname(settingsPath()), { recursive: true });
    writeFileSync(settingsPath(), JSON.stringify(s, null, 2), { mode: 0o600 });
  } catch { /* 忽略 */ }
  return s;
}

// ---- 局域网 ----
export const lanEnabled = () => read().lanEnabled !== false;
export function setLanEnabled(on) { const s = read(); s.lanEnabled = !!on; write(s); return s.lanEnabled; }

export const lanAuthEnabled = () => read().lanAuthEnabled !== false;
export function setLanAuthEnabled(on) { const s = read(); s.lanAuthEnabled = !!on; write(s); return s.lanAuthEnabled; }

export const lanIpOverride = () => read().lanIpOverride ?? '';
export function setLanIpOverride(value) {
  const ip = String(value ?? '').trim();
  if (ip && !isValidIpv4(ip)) throw new Error('局域网地址必须是 IPv4 | LAN address must be an IPv4');
  const s = read();
  if (ip) s.lanIpOverride = ip; else delete s.lanIpOverride;
  write(s);
  return ip;
}

// ---- PIN 自定义标记 ----
const PIN_KEYS = { public: 'publicPinCustom', lan: 'lanPinCustom' };
export function pinCustom(which) { return PIN_KEYS[which] ? read()[PIN_KEYS[which]] === true : false; }
export function setPinCustom(which, on) {
  const key = PIN_KEYS[which];
  if (!key) return false;
  const s = read();
  s[key] = !!on;
  write(s);
  return !!on;
}

// ---- NAS 中继 ----
export const relayEnabled = () => read().relayEnabled === true;
export function setRelayEnabled(on) { const s = read(); s.relayEnabled = !!on; write(s); return s.relayEnabled; }

export const relayUrl = () => read().relayUrl ?? '';
export function setRelayUrl(value) {
  const s = read();
  const v = String(value ?? '').trim();
  if (v) s.relayUrl = v; else delete s.relayUrl;
  write(s);
  return v;
}

export const relayToken = () => {
  const v = read().relayToken;
  return typeof v === 'string' ? v : '';
};
export function setRelayToken(value) {
  const v = String(value ?? '').trim();
  if (v && v.length < 16) {
    throw new Error('token 太短（至少 16 字符，建议 openssl rand -hex 24 生成） | token too short (min 16 chars)');
  }
  const s = read();
  if (v) s.relayToken = v; else delete s.relayToken;
  write(s);
  return v;
}

// ---- 代理端口 ----
export function proxyPort() {
  const v = Number(read().proxyPort);
  return Number.isInteger(v) && v >= 1 && v <= 65535 ? v : 0;
}
export function setProxyPort(value) {
  const n = Number(value);
  const s = read();
  if (Number.isInteger(n) && n >= 1 && n <= 65535) s.proxyPort = n; else delete s.proxyPort;
  write(s);
  return proxyPort();
}

// ---- 接入方式 ----
// mode: 'relay'（自建中继服务端）| 'tunnel'（外接隧道）| 'lan'（仅局域网）。
// 兼容：老配置没有 mode 字段——relayEnabled=true 视为 'relay'，否则 'lan'，
// 保证 0.3.x 用户升级后自动恢复行为与升级前完全一致。
const MODES = new Set(['relay', 'tunnel', 'lan']);
export function accessMode() {
  const s = read();
  if (MODES.has(s.mode)) return s.mode;
  return s.relayEnabled === true ? 'relay' : 'lan';
}
export function setAccessMode(mode) {
  if (!MODES.has(mode)) throw new Error(`未知接入方式 | unknown access mode: ${mode}`);
  const s = read();
  s.mode = mode;
  // relayEnabled 是 0.3.x 的恢复开关，保持与 mode 同步，老版本回滚也不乱
  s.relayEnabled = mode === 'relay';
  write(s);
  return mode;
}

// ---- 外接隧道配置 ----
// 形如 { tool: 'frp'|'cloudflared'|'natapp'|'custom', binPath: '', config: { 每工具字段 } }
// 密钥（frp token / natapp authtoken）随 settings.json 0600 落盘，与 relayToken 同级保护。
const TOOLS = new Set(['frp', 'cloudflared', 'natapp', 'custom']);
export function tunnelConfig() {
  const t = read().tunnel;
  if (!t || typeof t !== 'object') return { tool: 'frp', binPath: '', config: {} };
  return {
    tool: TOOLS.has(t.tool) ? t.tool : 'frp',
    binPath: typeof t.binPath === 'string' ? t.binPath : '',
    config: t.config && typeof t.config === 'object' ? t.config : {},
  };
}
export function setTunnelConfig({ tool, binPath, config } = {}) {
  if (tool !== undefined && !TOOLS.has(tool)) throw new Error(`未知隧道工具 | unknown tunnel tool: ${tool}`);
  const cur = tunnelConfig();
  const s = read();
  const next = {
    tool: tool ?? cur.tool,
    binPath: binPath !== undefined ? String(binPath ?? '').trim() : cur.binPath,
    config: { ...cur.config, ...(config && typeof config === 'object' ? config : {}) },
  };
  // config 里显式传 null 表示删除该字段
  for (const [k, v] of Object.entries(next.config)) if (v === null) delete next.config[k];
  s.tunnel = next;
  write(s);
  return next;
}

// ---- 隧道注入端口（稳定回环口，外接隧道的转发目标） ----
export function tunnelInletPort() {
  const v = Number(read().tunnelInletPort);
  return Number.isInteger(v) && v >= 1 && v <= 65535 ? v : 0;
}
export function setTunnelInletPort(value) {
  const n = Number(value);
  const s = read();
  if (Number.isInteger(n) && n >= 1 && n <= 65535) s.tunnelInletPort = n; else delete s.tunnelInletPort;
  write(s);
  return tunnelInletPort();
}

// ---- 恢复出厂 ----
export function resetSettings() {
  try { rmSync(settingsPath(), { force: true }); return true; } catch { return false; }
}
