// dsh-relay 设置页（原创 UI，双语）
import { createElement as h, useEffect, useRef, useState } from 'react';
import { RELAY_RPC_CHANNEL, RELAY_ENDPOINTS, redactStatus } from './api.js';

const name = 'dsh-relay';
const inject = ['connection', 'slots', 'locale'];

const zh = {
  section: 'DSH Relay',
  localeTag: 'zh',
  title: '手机访问（自建中继）',
  subtitle: '局域网扫码直连；外网经你自己的 NAS 中继，不依赖第三方云',
  lanAccess: '局域网访问',
  lanPin: '局域网密码',
  lanAuthSwitch: '密码保护',
  lanDisabledHint: '局域网访问已关闭，扫码/链接不可用',
  lanStarting: '正在获取局域网地址…',
  wanAccess: 'NAS 中继（外网访问）',
  enable: '开启',
  opening: '开启中…',
  stopRelay: '关闭',
  serverLabel: '服务端地址',
  tokenLabel: 'Token',
  serverPlaceholder: 'nas.example.com 或 nas.example.com:8443',
  tokenPlaceholder: 'NAS 上 RELAY_TOKEN 的值',
  save: '保存',
  cancel: '取消',
  edit: '修改',
  needCfg: '请先填写服务端地址和 Token',
  stateReady: '已连接 NAS，外网可访问',
  stateReconnecting: '连接断开，正在重连…',
  stateConnecting: '正在连接 NAS…',
  stateIdle: '未开启',
  retryInfo: '第 {n} 次重试 · 约 {s} 秒后',
  nasStats: '手机连接数 {phone} · 池空闲 {idle}',
  pinLabel: '访问密码',
  pinCustomHint: '已自定义',
  refresh: '刷新',
  customize: '自定义',
  customizing: '设置为',
  resetFactory: '恢复出厂设置',
  resetGo: '重置',
  resetIntro: '清空本插件设置并重置访问密码，不影响 DSH 其它数据',
  resetTitle: '确认恢复出厂设置？',
  resetBody: '将清空服务端地址、Token、开关与自定义密码，并重置访问密码。手机需要重新输入密码。',
  confirm: '确认',
  confirmRelay: '开启外网访问？',
  relayConfirmBody: '外网将能通过你的 NAS 访问这台电脑上的 DSH（可执行代码）。请确保：\n1. NAS 已部署 dsh-relay-server 且端口未对公网误开放其它服务\n2. 访问密码不要泄露（二维码即钥匙）',
  error: '错误：{msg}',
  unknown: '未知错误',
};

const en = {
  
  localeTag: 'en',
  title: 'Phone Access (Self-hosted Relay)',
  subtitle: 'LAN via QR; internet via your own NAS relay — no third-party cloud',
  lanAccess: 'LAN Access',
  lanPin: 'LAN PIN',
  lanAuthSwitch: 'PIN protection',
  lanDisabledHint: 'LAN access is disabled',
  lanStarting: 'Detecting LAN address…',
  wanAccess: 'NAS Relay (Internet)',
  enable: 'Enable',
  opening: 'Starting…',
  stopRelay: 'Stop',
  serverLabel: 'Server address',
  tokenLabel: 'Token',
  serverPlaceholder: 'nas.example.com or nas.example.com:8443',
  tokenPlaceholder: 'RELAY_TOKEN value from your NAS',
  save: 'Save',
  cancel: 'Cancel',
  edit: 'Edit',
  needCfg: 'Set the server address and token first',
  stateReady: 'Connected — internet access active',
  stateReconnecting: 'Connection lost, reconnecting…',
  stateConnecting: 'Connecting…',
  stateIdle: 'Off',
  retryInfo: 'retry #{n} in ~{s}s',
  nasStats: 'phone conns {phone} · pool idle {idle}',
  pinLabel: 'Access PIN',
  pinCustomHint: 'customized',
  refresh: 'Refresh',
  customize: 'Customize',
  customizing: 'Set to',
  resetFactory: 'Factory reset',
  resetGo: 'Reset',
  resetIntro: 'Clears plugin settings and resets PINs; DSH data is untouched',
  resetTitle: 'Factory reset?',
  resetBody: 'Clears the server address, token, switches and custom PINs, and resets access PINs. Phones must sign in again.',
  confirm: 'Confirm',
  confirmRelay: 'Enable internet access?',
  relayConfirmBody: 'Your NAS will expose this computer\'s DSH (which can execute code) to the internet. Make sure:\n1. dsh-relay-server is deployed on the NAS and no other port is exposed\n2. Keep the PIN / QR code private',
  error: 'Error: {msg}',
  unknown: 'unknown error',
};

// 简易样式（对齐 dsh 设计令牌，缺失时回退）
const styles = {
  card: { background: 'var(--dsw-alias-bg-layer-1,#fff)', border: '1px solid var(--dsw-alias-border-l2,#e5e7eb)', borderRadius: 12, padding: '16px 20px', maxWidth: 480 },
  block: { borderTop: '1px solid var(--dsw-alias-border-l2,#e5e7eb)', marginTop: 14, paddingTop: 14 },
  muted: { color: 'var(--dsw-alias-label-tertiary,#8b93a1)', fontSize: 12, lineHeight: 1.5 },
  code: { fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12, wordBreak: 'break-all', margin: '6px 0' },
  primary: { font: 'inherit', cursor: 'pointer', border: 'none', background: 'var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#4f6ef7))', color: '#fff', height: 32, padding: '0 14px', borderRadius: 999, fontSize: 13 },
  btn: { font: 'inherit', cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l2,#d1d5db)', background: 'var(--dsw-alias-bg-layer-1,#fff)', color: 'inherit', height: 32, padding: '0 14px', borderRadius: 999, fontSize: 13 },
  danger: { color: 'var(--dsw-alias-state-error-primary,#dc2626)' },
  warn: { color: 'var(--dsw-alias-state-warn-primary,#b45309)', fontSize: 12, lineHeight: 1.5 },
  qr: { width: 200, height: 200, borderRadius: 10, border: '1px solid var(--dsw-alias-border-l2,#e5e7eb)', margin: '8px 0' },
  input: { font: 'inherit', padding: '5px 9px', fontSize: 13, border: '1px solid var(--dsw-alias-border-l2,#d1d5db)', borderRadius: 6, outline: 'none', margin: '4px 0 0 6px', width: 220 },
  switchWrap: { flexShrink: 0, width: 40, height: 22, borderRadius: 11, border: 'none', padding: 0, position: 'relative', cursor: 'pointer', font: 'inherit' },
};

function Switch(on, onClick) {
  return h('button', { role: 'switch', 'aria-checked': !!on, style: { ...styles.switchWrap, background: on ? 'var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#4f6ef7))' : 'var(--dsw-alias-border-l2,#d1d5db)' }, onClick },
    h('span', { style: { position: 'absolute', top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff' } }));
}

function RelaySettingsTab({ rpcCall, t }) {
  const tf = (key, vars) => {
    let s = t(key);
    if (vars) for (const [k, v] of Object.entries(vars)) s = String(s).split(`{${k}}`).join(String(v));
    return s;
  };
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // { url, token }
  const [resetOpen, setResetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [customPin, setCustomPin] = useState(null); // { which, value }
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };

  const call = async (endpoint, payload) => {
    const res = await rpcCall(endpoint, payload);
    if (!res?.ok) throw new Error(res?.error?.message ?? 'RPC failed');
    return res.value;
  };

  const load = async () => {
    try { setStatus(redactStatus(await call(RELAY_ENDPOINTS.status, {}))); } catch { /* 瞬时失败 */ }
  };
  useEffect(() => {
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, []);

  const errText = (msg) => {
    const s = String(msg ?? '');
    const i = s.indexOf(' | ');
    const pick = i < 0 ? s : (t('localeTag') === 'en' ? s.slice(i + 3) : s.slice(0, i));
    return pick.trim();
  };

  const startRelay = async () => {
    setBusy(true);
    setError(null);
    try { setStatus(redactStatus(await call(RELAY_ENDPOINTS.relayStart, { confirm: true }))); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };
  const stopRelay = async () => {
    try { setStatus(redactStatus(await call(RELAY_ENDPOINTS.relayStop, {}))); } catch { /* 忽略 */ }
  };
  const saveConfig = async () => {
    try {
      setStatus(redactStatus(await call(RELAY_ENDPOINTS.relaySetConfig, { url: editing?.url ?? '', token: editing?.token ?? '' })));
      setEditing(null);
      showToast(t('save') + ' ✓');
    } catch (err) { setEditing((c) => ({ ...c, err: errText(err.message) })); }
  };
  const saveCustomPin = async (which) => {
    try {
      setStatus(redactStatus(await call(RELAY_ENDPOINTS.pinSetCustom, { which, value: customPin?.value ?? '' })));
      setCustomPin(null);
    } catch (err) { setCustomPin((c) => ({ ...c, err: errText(err.message) })); }
  };
  const doFactoryReset = async () => {
    setResetOpen(false);
    setBusy(true);
    try { setStatus(redactStatus(await call(RELAY_ENDPOINTS.relayReset, { confirm: true }))); setEditing(null); setCustomPin(null); showToast('✓'); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  const relayState = status?.relayState ?? { phase: 'idle' };
  const cfg = status?.relayConfig ?? { url: '', tokenSet: false };
  const row = (label, control, extra) => h('div', { style: { borderTop: '1px solid var(--dsw-alias-border-l2,#e5e7eb)', paddingTop: 9, marginTop: 9 } },
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 } }, h('span', { style: { fontSize: 13 } }, label), control), extra ?? null);
  const qrArea = (src, url, hint) => h('div', { style: { background: 'var(--dsw-alias-bg-layer-2,#f3f4f6)', borderRadius: 10, padding: '10px 12px', textAlign: 'center', margin: '10px 0' } },
    src ? h('img', { src, alt: 'QR', style: styles.qr }) : null,
    h('div', { style: styles.code }, url),
    h('div', { style: styles.muted }, hint));
  const pinRow = (which, label, value, custom) => row(label,
    customPin?.which === which ? null : h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 8 } },
      h('span', { style: { fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 13, letterSpacing: 1 } }, value),
      h('button', { style: { ...styles.btn, height: 26, padding: '0 10px', fontSize: 12 }, onClick: () => setCustomPin({ which, value: '', err: null }) }, t('customize'))),
    customPin?.which === which
      ? h('div', { style: { marginTop: 6, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
        t('customizing'),
        h('input', { style: { ...styles.input, width: 110, margin: 0, textAlign: 'center', letterSpacing: 2 }, type: 'password', maxLength: 8, value: customPin.value ?? '', autoFocus: true,
          onChange: (e) => setCustomPin((c) => ({ ...c, value: e.target.value.replace(/[^a-zA-Z0-9]/g, ''), err: null })),
          onKeyDown: (e) => { if (e.key === 'Enter') saveCustomPin(which); if (e.key === 'Escape') setCustomPin(null); } }),
        h('button', { style: { ...styles.btn, height: 26, padding: '0 10px', fontSize: 12 }, onClick: () => saveCustomPin(which) }, t('save')),
        h('button', { style: { ...styles.btn, height: 26, padding: '0 10px', fontSize: 12 }, onClick: () => setCustomPin(null) }, t('cancel')),
        customPin?.err ? h('span', { style: styles.danger }, customPin.err) : null)
      : (custom ? h('div', { style: { ...styles.muted, marginTop: 4 } }, t('pinCustomHint')) : null));

  return h('div', { style: styles.card },
    h('div', null,
      h('strong', null, t('title')),
      h('div', { style: styles.muted }, t('subtitle'))),

    // 局域网
    h('div', { style: styles.block },
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        h('span', { style: { fontWeight: 600, fontSize: 13 } }, t('lanAccess')),
        Switch(status?.lanEnabled !== false, async () => {
          try { setStatus(redactStatus(await call(RELAY_ENDPOINTS.lanSetEnabled, { on: status?.lanEnabled === false }))); } catch (err) { setError(err.message); }
        })),
      status?.lanEnabled === false
        ? h('div', { style: { ...styles.warn, marginTop: 8 } }, t('lanDisabledHint'))
        : (status?.lanUrl
          ? h('div', null,
            qrArea(status.lanQr, status.lanUrl, 'http · 同一局域网'),
            pinRow('lan', t('lanPin'), status.lanToken ?? '—', status.lanPinCustom),
            row(t('lanAuthSwitch'), Switch(status?.lanAuthEnabled !== false, async () => {
              try { setStatus(redactStatus(await call(RELAY_ENDPOINTS.lanAuthSetEnabled, { on: status?.lanAuthEnabled === false }))); } catch (err) { setError(err.message); }
            })))
          : h('div', { style: styles.muted }, t('lanStarting')))),

    // NAS 中继
    h('div', { style: styles.block },
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        h('span', { style: { fontWeight: 600, fontSize: 13 } }, t('wanAccess')),
        status?.relayRunning
          ? h('button', { style: { ...styles.btn, ...styles.danger, height: 28, padding: '0 12px', fontSize: 12 }, onClick: stopRelay }, t('stopRelay'))
          : h('button', { style: { ...styles.primary, height: 28, padding: '0 14px', fontSize: 12 }, disabled: busy, onClick: () => setConfirmOpen(true) }, busy ? t('opening') : t('enable'))),

      relayState.phase === 'reconnecting'
        ? h('div', { style: { marginTop: 8, fontSize: 12, color: '#b45309' } },
          t('stateReconnecting'),
          relayState.attempts ? h('div', { style: styles.muted }, tf('retryInfo', { n: relayState.attempts, s: relayState.nextRetryAt ? Math.max(0, Math.ceil((relayState.nextRetryAt - Date.now()) / 1000)) : '—' })) : null)
        : relayState.phase === 'connecting' ? h('div', { style: { marginTop: 8, fontSize: 12, color: '#6b7280' } }, t('stateConnecting'))
        : relayState.phase === 'error' ? h('div', { style: { marginTop: 8, fontSize: 12, ...styles.danger } }, t('error', { msg: errText(relayState.detail) || t('unknown') }))
        : null,

      status?.relayRunning
        ? h('div', null,
          qrArea(status.relayQr, status.relayUrl, 'https · 任意网络'),
          relayState.server?.phone !== undefined
            ? h('div', { style: styles.muted }, tf('nasStats', { phone: relayState.server.phone, idle: relayState.server.idle ?? '—' }))
            : null,
          pinRow('public', t('pinLabel'), status.accessToken ?? '—', status.publicPinCustom))
        : h('div', { style: { marginTop: 8, ...styles.muted } }, t('stateIdle')),

      // 服务端配置（地址 + token）
      row(`${t('serverLabel')} / ${t('tokenLabel')}`,
        editing ? null : h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 8 } },
          h('span', { style: { fontSize: 12, fontFamily: 'ui-monospace,Menlo,monospace' } }, cfg.url || '—'),
          h('button', { style: { ...styles.btn, height: 26, padding: '0 10px', fontSize: 12 }, onClick: () => setEditing({ url: cfg.url ?? '', token: '', err: null }) }, t('edit'))),
        editing
          ? h('div', { style: { marginTop: 6 } },
            h('div', null, t('serverLabel'),
              h('input', { style: styles.input, placeholder: t('serverPlaceholder'), value: editing.url, autoFocus: true,
                onChange: (e) => setEditing((c) => ({ ...c, url: e.target.value.trim(), err: null })),
                onKeyDown: (e) => { if (e.key === 'Escape') setEditing(null); } })),
            h('div', { style: { marginTop: 6 } }, t('tokenLabel'),
              h('input', { style: { ...styles.input, fontFamily: 'ui-monospace,Menlo,monospace' }, type: 'password', placeholder: editing?.token === null && cfg.tokenSet ? '••••••' : t('tokenPlaceholder'), value: editing.token,
                onChange: (e) => setEditing((c) => ({ ...c, token: e.target.value.trim(), err: null })),
                onKeyDown: (e) => { if (e.key === 'Enter') saveConfig(); if (e.key === 'Escape') setEditing(null); } })),
            h('div', { style: { marginTop: 8, display: 'flex', gap: 8 } },
              h('button', { style: { ...styles.btn, height: 26, padding: '0 12px', fontSize: 12 }, onClick: saveConfig }, t('save')),
              h('button', { style: { ...styles.btn, height: 26, padding: '0 12px', fontSize: 12 }, onClick: () => setEditing(null) }, t('cancel'))),
            editing.err ? h('div', { style: { ...styles.danger, marginTop: 4, fontSize: 12 } }, editing.err) : null)
          : h('div', { style: { ...styles.muted, marginTop: 4 } }, cfg.tokenSet ? 'Token ✓' : t('needCfg')))),

    error ? h('div', { style: { ...styles.danger, fontSize: 12, marginTop: 8 } }, `❌ ${errText(error)}`) : null,

    // 恢复出厂
    h('div', { style: styles.block },
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        h('span', { style: { fontWeight: 600, fontSize: 13 } }, t('resetFactory')),
        h('button', { style: { ...styles.btn, height: 28, padding: '0 12px', fontSize: 12, ...styles.danger }, onClick: () => setResetOpen(true) }, t('resetGo'))),
      h('div', { style: { ...styles.muted, marginTop: 6 } }, t('resetIntro'))),

    // 确认弹框：开启外网
    confirmOpen ? h('div', { style: dialogMask() }, h('div', { style: dialogCard() },
      h('div', { style: { fontWeight: 600, fontSize: 15, marginBottom: 10, color: '#b45309' } }, t('confirmRelay')),
      h('div', { style: { fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-line' } }, t('relayConfirmBody')),
      h('div', { style: { display: 'flex', gap: 8, marginTop: 16 } },
        h('button', { style: { ...styles.btn, flex: 1 }, onClick: () => setConfirmOpen(false) }, t('cancel')),
        h('button', { style: { ...styles.primary, flex: 1 }, onClick: () => { setConfirmOpen(false); startRelay(); } }, t('confirm'))))) : null,

    // 确认弹框：恢复出厂
    resetOpen ? h('div', { style: dialogMask() }, h('div', { style: dialogCard() },
      h('div', { style: { fontWeight: 600, fontSize: 15, marginBottom: 10, color: '#b45309' } }, t('resetTitle')),
      h('div', { style: { fontSize: 13, lineHeight: 1.7 } }, t('resetBody')),
      h('div', { style: { display: 'flex', gap: 8, marginTop: 16 } },
        h('button', { style: { ...styles.btn, flex: 1 }, onClick: () => setResetOpen(false) }, t('cancel')),
        h('button', { style: { ...styles.primary, flex: 1, background: 'var(--dsw-alias-state-error-primary,#dc2626)' }, onClick: doFactoryReset }, t('confirm'))))) : null,

    toast ? h('div', { style: { position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 10001, background: 'rgba(17,24,39,.92)', color: '#fff', borderRadius: 10, padding: '10px 16px', fontSize: 13 } }, toast) : null,
  );
}

function dialogMask() {
  return { position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
}
function dialogCard() {
  return { background: 'var(--dsw-alias-bg-layer-1,#fff)', borderRadius: 12, maxWidth: 420, width: '100%', padding: '20px 22px', boxShadow: '0 8px 32px rgba(0,0,0,.18)' };
}

export function apply(ctx) {
  if (ctx?.connection) {
    try { Object.defineProperty(ctx.connection, 'isLoopback', { value: true, writable: true, configurable: true }); }
    catch { try { ctx.connection.isLoopback = true; } catch { /* 忽略 */ } }
  }

  const rpcCall = (endpoint, payload, signal) => ctx.connection.rpc.call(RELAY_RPC_CHANNEL, endpoint, payload, signal);

  // 注册双语词典并取 t()；locale 服务不可用时回退中文
  let t = (key) => zh[key] ?? key;
  try {
    if (typeof ctx.locale?.register === 'function' && typeof ctx.locale?.bind === 'function') {
      ctx.locale.register('dsh-relay', { zh, en });
      ctx.effect(() => ctx.locale.register('dsh-relay', { zh, en }), 'dsh-relay: locale dictionaries');
      const bound = ctx.locale.bind('dsh-relay');
      if (typeof bound === 'function') t = bound;
    }
  } catch { /* 回退中文 */ }

  ctx.slots.inject('settings.section', () =>
    ctx.slots.register(
      { name: 'settings.section', id: 'dsh-relay', order: 2, label: () => t('section'), inject: () => ({ rpcCall, t }) },
      RelaySettingsTab,
    ));
}

export { name, inject };
