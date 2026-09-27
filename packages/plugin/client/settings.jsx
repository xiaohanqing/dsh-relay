// dsh-relay 设置页 v2：围绕「NAS 中继」自有的信息架构设计
//   顶部状态横幅（状态灯 + 主操作）→ 公网访问（引导式配置）→ 局域网（次级）→ 高级
// 与平台设计令牌对齐，但布局与交互为本项目原创。
import { createElement as h, useEffect, useRef, useState } from 'react';
import { RELAY_RPC_CHANNEL, RELAY_ENDPOINTS, redactStatus } from './api.js';

const name = 'dsh-relay';
const inject = ['connection', 'slots', 'locale'];

const zh = {
  localeTag: 'zh',
  appTitle: 'DSH Relay',
  appSub: '通过你自己的 NAS 从任何网络访问这台电脑上的 DSH',
  stReady: '已连接 NAS · 外网可访问',
  stConnecting: '正在连接 NAS…',
  stReconnecting: '连接中断，自动重连中',
  stIdle: '未开启',
  stError: '连接错误',
  openRelay: '开启外网访问',
  stopRelay: '停止',
  opening: '连接中…',
  secWan: '外网访问（经 NAS 中继）',
  secLan: '局域网直连',
  cfgTitle: '连接到你的 NAS',
  cfgStep1: '① NAS 服务端地址',
  cfgStep2: '② 部署时生成的 Token',
  serverPlaceholder: 'nas.example.com 或 192.168.1.10:8443',
  tokenPlaceholder: 'RELAY_TOKEN 的值',
  cfgSave: '保存并连接',
  cfgSaveOnly: '保存',
  cfgEdit: '修改服务端',
  cfgCurrent: '当前服务端',
  qrHintWan: '手机浏览器打开此地址（任意网络）',
  qrHintLan: '手机连同一 WiFi 扫码直达',
  wanOffHint: '开启后，手机在任意网络都能通过你的 NAS 访问这里。',
  pinTitle: '访问密码',
  pinDesc: '8 位字母/数字；自定义后不再轮换',
  lanPinDesc: '局域网入口的独立密码',
  lanSwitch: '局域网入口',
  lanAuthSwitch: '局域网密码',
  lanOff: '局域网入口已关闭',
  nasStats: 'NAS 实时：{phone} 台设备在线 · 隧道池空闲 {idle}',
  retryInfo: '第 {n} 次重试 · 约 {s} 秒后自动重试',
  adv: '高级',
  advAddress: '局域网地址',
  auto: '自动选择',
  reset: '恢复出厂',
  resetDesc: '清空本插件全部设置并重置密码（不影响 DSH 其它数据）',
  resetTitle: '恢复出厂设置？',
  resetBody: '服务端地址、Token、开关与自定义密码都会被清空，密码重置后手机需要重新输入。',
  confirm: '确认',
  cancel: '取消',
  copy: '复制',
  errPrefix: '出错了：',
};

const en = {
  localeTag: 'en',
  appTitle: 'DSH Relay',
  appSub: 'Reach the DSH on this computer from any network via your own NAS',
  stReady: 'Connected to NAS · internet access active',
  stConnecting: 'Connecting to NAS…',
  stReconnecting: 'Connection lost, reconnecting',
  stIdle: 'Off',
  stError: 'Connection error',
  openRelay: 'Enable internet access',
  stopRelay: 'Stop',
  opening: 'Connecting…',
  secWan: 'Internet (via NAS relay)',
  secLan: 'LAN direct',
  cfgTitle: 'Connect to your NAS',
  cfgStep1: '① Relay server address',
  cfgStep2: '② Token generated at deploy time',
  serverPlaceholder: 'nas.example.com or 192.168.1.10:8443',
  tokenPlaceholder: 'value of RELAY_TOKEN',
  cfgSave: 'Save & connect',
  cfgSaveOnly: 'Save',
  cfgEdit: 'Edit server',
  cfgCurrent: 'Server',
  qrHintWan: 'Open on your phone (any network)',
  qrHintLan: 'Same Wi-Fi: scan to open',
  wanOffHint: 'Once enabled, your phone can reach this DSH through your NAS from anywhere.',
  pinTitle: 'Access PIN',
  pinDesc: '8 letters/digits; fixed once customized',
  lanPinDesc: 'Separate PIN for the LAN entry',
  lanSwitch: 'LAN entry',
  lanAuthSwitch: 'LAN PIN',
  lanOff: 'LAN entry is disabled',
  nasStats: 'NAS live: {phone} device(s) online · pool idle {idle}',
  retryInfo: 'retry #{n} in ~{s}s',
  adv: 'Advanced',
  advAddress: 'LAN address',
  auto: 'Auto',
  reset: 'Factory reset',
  resetDesc: 'Clears all plugin settings and resets PINs (DSH data untouched)',
  resetTitle: 'Factory reset?',
  resetBody: 'Server address, token, switches and custom PINs will be cleared; phones must sign in again.',
  confirm: 'Confirm',
  cancel: 'Cancel',
  copy: 'Copy',
  errPrefix: 'Error: ',
};

// ---------- 样式（原创布局：状态横幅 + 引导式配置 + 折叠次级区） ----------
const S = {
  wrap: { background: 'var(--dsw-alias-bg-layer-1,#fff)', border: '1px solid var(--dsw-alias-border-l2,#e5e7eb)', borderRadius: 14, overflow: 'hidden' },
  banner: (color) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: color, color: '#fff' }),
  dot: () => ({ width: 10, height: 10, borderRadius: '50%', background: '#fff', boxShadow: '0 0 0 3px rgba(255,255,255,.25)', flexShrink: 0 }),
  body: { padding: '14px 18px 18px' },
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'var(--dsw-alias-label-tertiary,#8b93a1)', textTransform: 'uppercase', margin: '18px 0 8px' },
  card: { border: '1px solid var(--dsw-alias-border-l2,#e5e7eb)', borderRadius: 10, padding: '12px 14px' },
  field: { fontSize: 12, color: 'var(--dsw-alias-label-secondary,#6b7280)' },
  input: { font: 'inherit', display: 'block', width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: 13, border: '1px solid var(--dsw-alias-border-l2,#d1d5db)', borderRadius: 8, outline: 'none', marginTop: 4, background: 'var(--dsw-alias-bg-layer-1,#fff)', color: 'inherit' },
  primary: { font: 'inherit', cursor: 'pointer', border: 'none', background: 'var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#4f6ef7))', color: '#fff', height: 34, padding: '0 18px', borderRadius: 8, fontSize: 13, fontWeight: 600 },
  mini: { font: 'inherit', cursor: 'pointer', border: '1px solid var(--dsw-alias-border-l2,#d1d5db)', background: 'transparent', color: 'inherit', height: 24, padding: '0 8px', borderRadius: 6, fontSize: 11 },
  danger: { color: 'var(--dsw-alias-state-error-primary,#dc2626)' },
  url: { font: '600 15px ui-monospace,Menlo,monospace', wordBreak: 'break-all', color: 'var(--dsw-alias-label-primary,inherit)' },
  pin: { font: '16px ui-monospace,Menlo,monospace', letterSpacing: 3 },
  muted: { color: 'var(--dsw-alias-label-tertiary,#8b93a1)', fontSize: 12, lineHeight: 1.5 },
  qr: { width: 132, height: 132, borderRadius: 8, display: 'block' },
  grid2: { display: 'grid', gridTemplateColumns: '132px 1fr', gap: 14, alignItems: 'start' },
  warn: { color: 'var(--dsw-alias-state-warn-primary,#b45309)', fontSize: 12 },
  err: { color: 'var(--dsw-alias-state-error-primary,#dc2626)', fontSize: 12 },
};
const STATE_COLORS = { ready: '#16a34a', connecting: '#d97706', reconnecting: '#d97706', error: '#dc2626', idle: '#6b7280' };

function Switch(on, onClick) {
  return h('button', { role: 'switch', 'aria-checked': !!on, onClick, style: { flexShrink: 0, width: 38, height: 20, borderRadius: 10, border: 'none', padding: 0, position: 'relative', cursor: 'pointer', font: 'inherit', background: on ? 'var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#4f6ef7))' : 'var(--dsw-alias-border-l2,#d1d5db)' } },
    h('span', { style: { position: 'absolute', top: 2, left: on ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff' } }));
}

function RelaySettingsTab({ rpcCall, t }) {
  const tf = (key, vars) => { let s = t(key); if (vars) for (const [k, v] of Object.entries(vars)) s = String(s).split(`{${k}}`).join(String(v)); return s; };
  const [st, setSt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [cfgEdit, setCfgEdit] = useState(null);
  const [pinEdit, setPinEdit] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const toastT = useRef(null);
  const showToast = (m) => { setToast(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(null), 2000); };

  const call = async (ep, payload) => {
    const r = await rpcCall(ep, payload);
    if (!r?.ok) throw new Error(r?.error?.message ?? 'RPC failed');
    return r.value;
  };
  const poll = async () => { try { setSt(redactStatus(await call(RELAY_ENDPOINTS.status, {}))); } catch { /* 忽略 */ } };
  useEffect(() => { poll(); const t2 = setInterval(poll, 3000); return () => clearInterval(t2); }, []);

  const errText = (m) => { const s = String(m ?? ''); const i = s.indexOf(' | '); return i < 0 ? s : (t('localeTag') === 'en' ? s.slice(i + 3) : s.slice(0, i)).trim(); };
  const apply = async (fn) => { setBusy(true); setError(null); try { setSt(redactStatus(await fn())); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  const copy = (text) => { try { navigator.clipboard.writeText(text); showToast('✓'); } catch { /* 忽略 */ } };

  const phase = st?.relayState?.phase ?? 'idle';
  const cfg = st?.relayConfig ?? { url: '', tokenSet: false };
  const rs = st?.relayState ?? {};
  const bannerText = phase === 'ready' ? t('stReady') : phase === 'reconnecting' ? t('stReconnecting') : phase === 'connecting' ? t('stConnecting') : phase === 'error' ? t('stError') : t('stIdle');
  const bannerColor = STATE_COLORS[phase] ?? STATE_COLORS.idle;
  const errOf = (m) => h('div', { style: S.err }, t('errPrefix') + errText(m));

  const savePin = async (which) => { try { setSt(redactStatus(await call(RELAY_ENDPOINTS.pinSetCustom, { which, value: pinEdit?.value ?? '' }))); setPinEdit(null); } catch (e) { setPinEdit((c) => ({ ...c, err: e.message })); } };
  const pinBlock = (which, value, custom, desc) => h('div', { style: { marginTop: 10 } },
    h('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' } },
      h('span', { style: { ...S.field, fontWeight: 600 } }, t('pinTitle')),
      custom ? h('span', { style: S.muted }, '✓') : null),
    h('div', { style: S.muted }, desc),
    pinEdit?.which === which
      ? h('div', { style: { display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' } },
        h('input', { style: { ...S.input, width: 120, marginTop: 0, textAlign: 'center', letterSpacing: 3, fontSize: 15 }, maxLength: 8, autoFocus: true, value: pinEdit.value ?? '',
          onChange: (e) => setPinEdit((c) => ({ ...c, value: e.target.value.replace(/[^a-zA-Z0-9]/g, '') })),
          onKeyDown: (e) => { if (e.key === 'Enter') savePin(which); if (e.key === 'Escape') setPinEdit(null); } }),
        h('button', { style: S.mini, onClick: () => savePin(which) }, '✓'),
        h('button', { style: S.mini, onClick: () => setPinEdit(null) }, '✕'),
        pinEdit.err ? errOf(pinEdit.err) : null)
      : h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 } },
        h('span', { style: S.pin }, value ?? '········'),
        h('button', { style: S.mini, onClick: () => setPinEdit({ which, value: '' }) }, t('customize')),
        which === 'lan' ? null : h('span', { style: S.muted }, t('pinDesc'))));

  const saveCfg = async (andStart) => {
    try {
      setSt(redactStatus(await call(RELAY_ENDPOINTS.relaySetConfig, { url: cfgEdit?.url ?? '', token: cfgEdit?.token ?? '' })));
      setCfgEdit(null);
      if (andStart) setSt(redactStatus(await call(RELAY_ENDPOINTS.relayStart, { confirm: true })));
    } catch (e) { setCfgEdit((c) => ({ ...c, err: e.message })); }
  };

  const wanOn = st?.relayRunning === true;
  const wanConfigured = Boolean(cfg.url);
  const wanCfgForm = h('div', null,
    h('div', { style: { fontWeight: 600, fontSize: 13, marginBottom: 8 } }, t('cfgTitle')),
    h('div', { style: S.field }, t('cfgStep1')),
    h('input', { style: S.input, placeholder: t('serverPlaceholder'), value: cfgEdit?.url ?? '', autoFocus: true,
      onChange: (e) => setCfgEdit((c) => ({ ...c, url: e.target.value.trim() })) }),
    h('div', { style: { ...S.field, marginTop: 10 } }, t('cfgStep2')),
    h('input', { style: { ...S.input, fontFamily: 'ui-monospace,Menlo,monospace' }, type: 'password', placeholder: t('tokenPlaceholder'), value: cfgEdit?.token ?? '',
      onChange: (e) => setCfgEdit((c) => ({ ...c, token: e.target.value.trim() })) }),
    h('div', { style: { display: 'flex', gap: 8, marginTop: 12 } },
      h('button', { style: S.primary, disabled: busy, onClick: () => saveCfg(true) }, busy ? t('opening') : t('cfgSave'))));

  const wanHead = h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 } },
    h('div', null,
      h('div', { style: { ...S.field, fontWeight: 600 } }, t('cfgCurrent')),
      h('div', { style: S.url }, cfg.url || '—')),
    h('button', { style: S.mini, onClick: () => setCfgEdit({ url: cfg.url ?? '', token: '', err: null }) }, t('cfgEdit')));

  const wanEditForm = h('div', { style: { marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--dsw-alias-border-l2,#e5e7eb)' } },
    h('div', { style: S.field }, t('cfgStep1')),
    h('input', { style: S.input, value: cfgEdit?.url ?? '', onChange: (e) => setCfgEdit((c) => ({ ...c, url: e.target.value.trim() })) }),
    h('div', { style: { ...S.field, marginTop: 8 } }, t('cfgStep2')),
    h('input', { style: { ...S.input, fontFamily: 'ui-monospace,Menlo,monospace' }, type: 'password', placeholder: cfg.tokenSet ? '••••••••' : t('tokenPlaceholder'), value: cfgEdit?.token ?? '', onChange: (e) => setCfgEdit((c) => ({ ...c, token: e.target.value.trim() })) }),
    h('div', { style: { display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' } },
      h('button', { style: S.mini, onClick: () => saveCfg(false) }, t('cfgSaveOnly')),
      h('button', { style: S.mini, onClick: () => setCfgEdit(null) }, t('cancel')),
      cfgEdit?.err ? errOf(cfgEdit.err) : null));

  const wanStart = h('div', { style: { marginTop: 12 } },
    h('div', { style: S.muted }, t('wanOffHint')),
    h('button', { style: { ...S.primary, marginTop: 8 }, disabled: busy, onClick: () => apply(() => call(RELAY_ENDPOINTS.relayStart, { confirm: true })) }, busy ? t('opening') : t('openRelay')));

  let wanQr = null;
  if (wanOn && st?.relayUrl) {
    wanQr = h('div', { style: { ...S.grid2, marginTop: 12 } },
      h('img', { src: st.relayQr, alt: 'QR', style: S.qr }),
      h('div', null,
        h('div', { style: S.url }, st.relayUrl),
        h('div', { style: { ...S.muted, margin: '4px 0 10px' } }, t('qrHintWan')),
        h('button', { style: S.mini, onClick: () => copy(st.relayUrl) }, t('copy')),
        rs.server?.phone !== undefined ? h('div', { style: { ...S.muted, marginTop: 10 } }, tf('nasStats', { phone: rs.server.phone, idle: rs.server.idle ?? '—' })) : null,
        pinBlock('public', st.accessToken, st.publicPinCustom, t('pinDesc'))));
  }

  const wanBlock = h('div', { style: S.card },
    !wanOn && !wanConfigured ? wanCfgForm : wanHead,
    cfgEdit ? wanEditForm : null,
    !wanOn ? wanStart : null,
    wanOn ? wanQr : null);

  const lanBlock = h('div', { style: S.card },
    st?.lanEnabled === false
      ? h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
        h('span', { style: S.muted }, t('lanOff')), Switch(false, () => apply(() => call(RELAY_ENDPOINTS.lanSetEnabled, { on: true }))))
      : h('div', null,
        h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' } },
          h('span', { style: { ...S.field, fontWeight: 600 } }, t('lanSwitch')), Switch(true, () => apply(() => call(RELAY_ENDPOINTS.lanSetEnabled, { on: false })))),
        st?.lanUrl ? h('div', { style: { ...S.grid2, marginTop: 10 } },
          h('img', { src: st.lanQr, alt: 'QR', style: S.qr }),
          h('div', null,
            h('div', { style: { ...S.url, fontSize: 13 } }, st.lanUrl),
            h('div', { style: { ...S.muted, margin: '4px 0 8px' } }, t('qrHintLan')),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
              h('span', { style: { ...S.field, fontWeight: 600 } }, t('lanAuthSwitch')), Switch(st.lanAuthEnabled !== false, () => apply(() => call(RELAY_ENDPOINTS.lanAuthSetEnabled, { on: st?.lanAuthEnabled === false })))),
            st.lanAuthEnabled !== false ? pinBlock('lan', st.lanToken, st.lanPinCustom, t('lanPinDesc')) : null))
          : h('div', { style: S.muted }, '…')));

  const advBlock = h('div', { style: S.card },
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 } },
      h('span', { style: { ...S.field, fontWeight: 600 } }, t('advAddress')),
      h('select', { value: st?.lanIpOverride ?? '', style: { ...S.input, width: 'auto', marginTop: 0 }, onChange: (e) => apply(() => call(RELAY_ENDPOINTS.lanSetOverride, { ip: e.target.value })) },
        h('option', { value: '' }, t('auto')),
        (st?.lanCandidates ?? []).map((ip) => h('option', { key: ip, value: ip }, ip)))),
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--dsw-alias-border-l2,#e5e7eb)' } },
      h('span', { style: { ...S.field, fontWeight: 600, ...S.danger } }, t('reset')),
      h('button', { style: { ...S.mini, ...S.danger }, onClick: () => setDialog('reset') }, t('reset'))),
    h('div', { style: S.muted }, t('resetDesc')));

  return h('div', { style: S.wrap },
    h('div', { style: S.banner(bannerColor) },
      h('span', { style: S.dot() }),
      h('div', { style: { flex: 1 } },
        h('div', { style: { fontWeight: 700, fontSize: 15 } }, t('appTitle')),
        h('div', { style: { fontSize: 12, opacity: .9 } }, bannerText)),
      wanOn
        ? h('button', { style: { ...S.mini, borderColor: 'rgba(255,255,255,.5)', color: '#fff', height: 28, fontSize: 12 }, onClick: () => apply(() => call(RELAY_ENDPOINTS.relayStop, {})) }, t('stopRelay'))
        : null),
    h('div', { style: S.body },
      h('div', { style: { ...S.muted, marginTop: -6, marginBottom: 4 } }, t('appSub')),
      phase === 'reconnecting' && rs.attempts ? h('div', { style: { ...S.warn, marginBottom: 6 } }, tf('retryInfo', { n: rs.attempts, s: rs.nextRetryAt ? Math.max(0, Math.ceil((rs.nextRetryAt - Date.now()) / 1000)) : '—' })) : null,
      error ? h('div', { style: { ...S.err, marginBottom: 6 } }, t('errPrefix') + errText(error)) : null,
      h('div', { style: S.sectionLabel }, t('secWan')), wanBlock,
      h('div', { style: S.sectionLabel }, t('secLan')), lanBlock,
      h('div', { style: S.sectionLabel }, t('adv')), advBlock),
    dialog === 'reset' ? h('div', { style: { position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 } },
      h('div', { style: { background: 'var(--dsw-alias-bg-layer-1,#fff)', borderRadius: 12, maxWidth: 400, width: '100%', padding: '20px 22px' } },
        h('div', { style: { fontWeight: 700, fontSize: 15, marginBottom: 8 } }, t('resetTitle')),
        h('div', { style: { fontSize: 13, lineHeight: 1.6, color: 'var(--dsw-alias-label-secondary,#6b7280)' } }, t('resetBody')),
        h('div', { style: { display: 'flex', gap: 8, marginTop: 16 } },
          h('button', { style: { ...S.mini, flex: 1, height: 34, fontSize: 13 }, onClick: () => setDialog(null) }, t('cancel')),
          h('button', { style: { ...S.primary, flex: 1, background: 'var(--dsw-alias-state-error-primary,#dc2626)' }, onClick: async () => { setDialog(null); try { setSt(redactStatus(await call(RELAY_ENDPOINTS.relayReset, { confirm: true }))); setCfgEdit(null); showToast('✓'); } catch (e) { setError(e.message); } } }, t('confirm'))))) : null,
    toast ? h('div', { style: { position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 10001, background: 'rgba(17,24,39,.92)', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 13 } }, toast) : null);
}

export function apply(ctx) {
  if (ctx?.connection) {
    try { Object.defineProperty(ctx.connection, 'isLoopback', { value: true, writable: true, configurable: true }); }
    catch { try { ctx.connection.isLoopback = true; } catch { /* 忽略 */ } }
  }
  const rpcCall = (endpoint, payload, signal) => ctx.connection.rpc.call(RELAY_RPC_CHANNEL, endpoint, payload, signal);
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
      { name: 'settings.section', id: 'dsh-relay', order: 2, label: () => t('appTitle'), inject: () => ({ rpcCall, t }) },
      RelaySettingsTab,
    ));
}

export { name, inject };
