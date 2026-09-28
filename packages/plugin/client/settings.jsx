// dsh-relay 设置页 v3：围绕「接入方式」自有的信息架构设计
//   顶部状态横幅（按接入方式感知）→ 接入方式（模式卡片：自建服务端 / 外接隧道 + 仅局域网行）→ 局域网 → 高级
// 与平台设计令牌对齐，但布局与交互为本项目原创。
import { createElement as h, useEffect, useRef, useState } from 'react';
import { RELAY_RPC_CHANNEL, RELAY_ENDPOINTS, redactStatus } from './api.js';

const name = 'dsh-relay';
const inject = ['connection', 'slots', 'locale'];

const zh = {
  localeTag: 'zh',
  appTitle: 'DSH Relay',
  appSub: '从任何网络访问这台电脑上的 DSH：自建服务端，或复用你已有的隧道',
  stReady: '已连接服务端 · 外网可访问',
  stConnecting: '正在连接服务端…',
  stReconnecting: '连接中断，自动重连中',
  stIdle: '未开启',
  stError: '连接错误',
  openRelay: '开启外网访问',
  stopRelay: '停止',
  opening: '连接中…',
  secAccess: '接入方式',
  secLan: '局域网直连',
  modeRelay: '自建服务端',
  modeRelayDesc: '自己的中继服务端：多台电脑统一管理、准入审批、密钥轮换',
  modeTunnel: '外接隧道',
  modeTunnelDesc: '复用已有的 frp 等隧道工具，无需部署服务端',
  modeActive: '使用中',
  lanSummaryOff: '外网访问未开启',
  lanSummaryRelay: '外网经中继服务端开放',
  lanSummaryTunnel: '外网经外接隧道开放',
  stopAllWan: '停止外网访问',
  tunnelTool: '隧道工具',
  tunnelSave: '保存配置',
  tunnelStart: '启动隧道',
  tunnelDownload: '下载',
  toolMissing: '未找到',
  tunnelRunningHint: '隧道运行中，修改配置请先停止',
  tunnelStateRunning: '隧道运行中',
  tunnelStateStarting: '正在启动隧道…',
  tunnelStateBackoff: '隧道进程异常退出，自动重启中',
  tunnelStateError: '隧道错误',
  tunnelStateIdle: '隧道未启动',
  fProxyType: '暴露形态',
  fTcp: 'TCP 端口映射',
  fHttp: 'HTTP 域名',
  fHttps: 'HTTPS 域名',
  fRaw: '高级：完整 frpc.toml',
  fServerAddr: 'frps 服务器地址',
  fServerPort: 'frps 端口',
  fToken: '鉴权 token',
  fRemotePort: '远程端口（可空）',
  fRemotePortPh: '留空 = 服务端随机分配',
  fCustomDomain: '自定义域名',
  fSubdomain: '子域名（frps 的 subDomainHost 下）',
  fRawToml: 'frpc.toml 内容（localPort 指向注入端口）',
  fBinPath: '二进制路径（可空 = 自动探测）',
  fTokenCloud: 'Tunnel Token（可空）',
  fTokenCloudPh: '留空 = 免账号临时域名',
  fAuthtoken: '隧道 authtoken',
  fCommand: '启动命令',
  fCommandPh: 'bore local {{port}} --to bore.pub',
  fConfigTemplate: '配置文件模板（可选，支持 {{port}} / {{configFile}} 占位符）',
  fConfigFileName: '配置文件名（可选）',
  fPublicUrl: '公网地址（可选，用于二维码）',
  warnPlainTcp: '手机到 frps 之间为明文 HTTP，访问密码会经过该链路；frps 有域名和证书时建议改用 HTTPS 形态',
  warnPlainCustom: '公网地址为明文 HTTP，访问密码会经过该链路；建议使用 HTTPS 入口',
  advTunnel: '高级：稳定注入端口',
  advTunnelDesc: '本机回环端口。任何隧道工具把流量转发到这里即可接入，无需插件托管',
  cfgTitle: '连接到你的服务端',
  cfgStep1: '① 服务端地址',
  cfgStep2: '② 服务端密钥串（在服务端管理台生成/批准接入后自动获得）',
  serverPlaceholder: 'relay.example.com 或 1.2.3.4:8443',
  tokenPlaceholder: 'RELAY_TOKEN 的值',
  cfgSave: '保存并连接',
  cfgSaveOnly: '保存',
  cfgEdit: '修改服务端',
  cfgCurrent: '当前服务端',
  qrHintWan: '手机浏览器打开此地址（任意网络）',
  qrHintLan: '手机连同一 WiFi 扫码直达',
  wanOffHint: '开启后，手机在任意网络都能通过你的中继服务端访问这里。',
  pinTitle: '访问密码',
  pinDesc: '8 位字母/数字；自定义后不再轮换',
  lanPinDesc: '局域网入口的独立密码',
  customize: '自定义',
  reveal: '显示',
  hide: '隐藏',
  lanSwitch: '局域网入口',
  lanAuthSwitch: '局域网密码',
  lanOff: '局域网入口已关闭',
  serverStats: '服务端实时：{phone} 台设备在线 · 隧道池空闲 {idle}',
  retryInfo: '第 {n} 次重试 · 约 {s} 秒后自动重试',
  adv: '高级',
  advAddress: '局域网地址',
  enrollTitle: '一键接入（推荐）',
  enrollCodeLabel: '邀请码（服务端开启时必填）',
  enrollCodePh: '没有可留空',
  enrollBtn: '申请接入',
  enrollHint: '管理员在服务端管理台批准后自动完成配置，无需复制密钥串',
  enrollBack: '← 返回一键接入',
  manualToken: '手动填写 Token（高级）',
  cancelEnroll: '取消申请',
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
  appSub: 'Reach the DSH on this computer from anywhere — your own relay server, or a tunnel you already have',
  stReady: 'Connected · internet access active',
  stConnecting: 'Connecting to relay server…',
  stReconnecting: 'Connection lost, reconnecting',
  stIdle: 'Off',
  stError: 'Connection error',
  openRelay: 'Enable internet access',
  stopRelay: 'Stop',
  opening: 'Connecting…',
  secAccess: 'Access mode',
  secLan: 'LAN direct',
  modeRelay: 'Relay server',
  modeRelayDesc: 'Your own relay: multi-device management, approval join, key rotation',
  modeTunnel: 'Bring your own tunnel',
  modeTunnelDesc: 'Reuse a tunnel you already have (frp, …) — no server to deploy',
  modeActive: 'Active',
  lanSummaryOff: 'Internet access is off',
  lanSummaryRelay: 'Internet access via relay server',
  lanSummaryTunnel: 'Internet access via external tunnel',
  stopAllWan: 'Stop internet access',
  tunnelTool: 'Tunnel tool',
  tunnelSave: 'Save settings',
  tunnelStart: 'Start tunnel',
  tunnelDownload: 'Download',
  toolMissing: 'not found',
  tunnelRunningHint: 'Tunnel is running — stop it before changing settings',
  tunnelStateRunning: 'Tunnel running',
  tunnelStateStarting: 'Starting tunnel…',
  tunnelStateBackoff: 'Tunnel exited, restarting',
  tunnelStateError: 'Tunnel error',
  tunnelStateIdle: 'Tunnel not running',
  fProxyType: 'Exposure mode',
  fTcp: 'TCP port mapping',
  fHttp: 'HTTP vhost',
  fHttps: 'HTTPS vhost',
  fRaw: 'Advanced: full frpc.toml',
  fServerAddr: 'frps server address',
  fServerPort: 'frps port',
  fToken: 'Auth token',
  fRemotePort: 'Remote port (optional)',
  fRemotePortPh: 'empty = assigned by the server',
  fCustomDomain: 'Custom domain',
  fSubdomain: 'Subdomain (under frps subDomainHost)',
  fRawToml: 'frpc.toml content (localPort points at the inlet)',
  fBinPath: 'Binary path (empty = auto-detect)',
  fTokenCloud: 'Tunnel token (optional)',
  fTokenCloudPh: 'empty = account-free temporary URL',
  fAuthtoken: 'Tunnel authtoken',
  fCommand: 'Launch command',
  fCommandPh: 'bore local {{port}} --to bore.pub',
  fConfigTemplate: 'Config file template (optional; {{port}} / {{configFile}} placeholders)',
  fConfigFileName: 'Config file name (optional)',
  fPublicUrl: 'Public URL (optional, for the QR code)',
  warnPlainTcp: 'Traffic between your phone and the frp server is plain HTTP — the access PIN travels over it. Prefer the HTTPS mode when your frps has a domain and certificate.',
  warnPlainCustom: 'The public URL is plain HTTP — the access PIN travels over it. Prefer an HTTPS entry.',
  advTunnel: 'Advanced: stable inlet port',
  advTunnelDesc: 'Loopback port on this computer. Any tunnel tool can simply forward traffic here — no supervision needed',
  cfgTitle: 'Connect to your relay server',
  cfgStep1: '① Server address',
  cfgStep2: '② Server secret (from admin console or auto-issued on approval)',
  serverPlaceholder: 'relay.example.com or 1.2.3.4:8443',
  tokenPlaceholder: 'value of RELAY_TOKEN',
  cfgSave: 'Save & connect',
  cfgSaveOnly: 'Save',
  cfgEdit: 'Edit server',
  cfgCurrent: 'Server',
  qrHintWan: 'Open on your phone (any network)',
  qrHintLan: 'Same Wi-Fi: scan to open',
  wanOffHint: 'Once enabled, your phone can reach this DSH through your relay server from anywhere.',
  pinTitle: 'Access PIN',
  pinDesc: '8 letters/digits; fixed once customized',
  lanPinDesc: 'Separate PIN for the LAN entry',
  customize: 'Customize',
  reveal: 'Show',
  hide: 'Hide',
  lanSwitch: 'LAN entry',
  lanAuthSwitch: 'LAN PIN',
  lanOff: 'LAN entry is disabled',
  serverStats: 'Server live: {phone} device(s) online · pool idle {idle}',
  retryInfo: 'retry #{n} in ~{s}s',
  adv: 'Advanced',
  advAddress: 'LAN address',
  enrollTitle: 'One-click join (recommended)',
  enrollCodeLabel: 'Invite code (if required by the server)',
  enrollCodePh: 'leave empty if none',
  enrollBtn: 'Request access',
  enrollHint: 'Approve it in the server admin console — no secret copy-paste needed',
  enrollBack: '← Back to one-click join',
  manualToken: 'Enter token manually (advanced)',
  cancelEnroll: 'Cancel request',
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

// ---------- 样式（原创布局：状态横幅 + 接入方式卡片 + 引导式配置 + 折叠次级区） ----------
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
  ok: { color: 'var(--dsw-alias-state-success-primary,#16a34a)', fontSize: 12 },
  link: { color: 'var(--dsw-alias-brand-primary,#4f6ef7)', textDecoration: 'underline' },
};
const STATE_COLORS = { ready: '#16a34a', connecting: '#d97706', reconnecting: '#d97706', error: '#dc2626', idle: '#6b7280' };
const TUNNEL_STATE_COLORS = { running: '#16a34a', starting: '#d97706', backoff: '#d97706', error: '#dc2626', idle: '#6b7280' };
const TOOL_ORDER = ['frp', 'cloudflared', 'natapp', 'custom'];

function Switch(on, onClick) {
  return h('button', { role: 'switch', 'aria-checked': !!on, onClick, style: { flexShrink: 0, width: 38, height: 20, borderRadius: 10, border: 'none', padding: 0, position: 'relative', cursor: 'pointer', font: 'inherit', background: on ? 'var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#4f6ef7))' : 'var(--dsw-alias-border-l2,#d1d5db)' } },
    h('span', { style: { position: 'absolute', top: 2, left: on ? 19 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff' } }));
}

function RelaySettingsTab({ rpcCall, t }) {
  const tf = (key, vars) => { let s = t(key); if (vars) for (const [k, v] of Object.entries(vars)) s = String(s).split(`{${k}}`).join(String(v)); return s; };
  const localeEn = t('localeTag') === 'en';
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
  const poll = async () => {
    try { setSt(redactStatus(await call(RELAY_ENDPOINTS.status, {}))); } catch { /* 忽略 */ }
    try { const d = await call(RELAY_ENDPOINTS.tunnelDetect, {}); setTools(Array.isArray(d?.tools) ? d.tools : []); } catch { /* 忽略 */ }
  };
  useEffect(() => { poll(); const t2 = setInterval(poll, 3000); return () => clearInterval(t2); }, []);

  const errText = (m) => { const s = String(m ?? ''); const i = s.indexOf(' | '); return i < 0 ? s : (localeEn ? s.slice(i + 3) : s.slice(0, i)).trim(); };
  const apply = async (fn) => { setBusy(true); setError(null); try { setSt(redactStatus(await fn())); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  const applyTunnel = async (fn) => { setBusy(true); setTunnelErr(null); try { setSt(redactStatus(await fn())); } catch (e) { setTunnelErr(e.message); } finally { setBusy(false); } };
  const copy = (text) => { try { navigator.clipboard.writeText(text); showToast('✓'); } catch { /* 忽略 */ } };

  // ---- 接入方式与状态 ----
  const mode = st?.mode ?? 'lan';
  const [view, setView] = useState(null); // 只切换展示的配置区，不代表已启用
  const effView = view ?? (mode === 'tunnel' ? 'tunnel' : 'relay');
  const rs = st?.relayState ?? {};
  const phase = rs.phase ?? 'idle';
  const cfg = st?.relayConfig ?? { url: '', tokenSet: false };
  const ts = st?.tunnelState ?? { phase: 'idle' };
  const wanOn = st?.relayRunning === true;
  const tunnelOn = st?.tunnelRunning === true;
  const wanConfigured = Boolean(cfg.url);
  const enroll = st?.enroll ?? { phase: 'idle', detail: '' };

  let bannerText; let bannerColor;
  if (mode === 'tunnel') {
    bannerText = (ts.phase === 'running' ? t('tunnelStateRunning') : ts.phase === 'starting' ? t('tunnelStateStarting') : ts.phase === 'backoff' ? t('tunnelStateBackoff') : ts.phase === 'error' ? t('tunnelStateError') : t('tunnelStateIdle'))
      + (ts.tool ? ` · ${ts.tool}` : '');
    bannerColor = TUNNEL_STATE_COLORS[ts.phase] ?? TUNNEL_STATE_COLORS.idle;
  } else if (mode === 'relay') {
    bannerText = phase === 'ready' ? t('stReady') : phase === 'reconnecting' ? t('stReconnecting') : phase === 'connecting' ? t('stConnecting') : phase === 'error' ? t('stError') : t('stIdle');
    bannerColor = STATE_COLORS[phase] ?? STATE_COLORS.idle;
  } else {
    bannerText = t('stIdle');
    bannerColor = STATE_COLORS.idle;
  }
  const errOf = (m) => h('div', { style: S.err }, t('errPrefix') + errText(m));

  const savePin = async (which) => { try { setSt(redactStatus(await call(RELAY_ENDPOINTS.pinSetCustom, { which, value: pinEdit?.value ?? '' }))); setPinEdit(null); } catch (e) { setPinEdit((c) => ({ ...c, err: e.message })); } };
  // 密码默认掩码显示，点「显示」才可见（防止旁人屏幕偷窥/截图泄露）
  const [pinReveal, setPinReveal] = useState({});
  // 服务端地址同样默认掩码：点击文本本体切换显示（无独立按钮）
  const [urlReveal, setUrlReveal] = useState(false);
  const maskableUrl = (url) => h('div', {
    style: { ...S.url, cursor: 'pointer', userSelect: 'none' },
    title: urlReveal ? t('hide') : t('reveal'),
    onClick: () => setUrlReveal((v) => !v),
  }, url ? (urlReveal ? url : String(url).replace(/^(https?:\/\/).+$/i, '$1••••••••••••')) : '—');
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
        h('span', { style: { ...S.pin, fontFamily: pinReveal[which] ? S.pin.fontFamily : 'inherit', letterSpacing: pinReveal[which] ? S.pin.letterSpacing : 2 } },
          pinReveal[which] ? (value ?? '········') : '········'),
        h('button', { style: S.mini, onClick: () => setPinReveal((c) => ({ ...c, [which]: !c[which] })) },
          pinReveal[which] ? t('hide') : t('reveal')),
        h('button', { style: S.mini, onClick: () => setPinEdit({ which, value: '' }) }, t('customize')),
        which === 'lan' ? null : h('span', { style: S.muted }, t('pinDesc'))));

  const saveCfg = async (andStart) => {
    try {
      setSt(redactStatus(await call(RELAY_ENDPOINTS.relaySetConfig, { url: cfgEdit?.url ?? '', token: cfgEdit?.token ?? '' })));
      setCfgEdit(null);
      if (andStart) setSt(redactStatus(await call(RELAY_ENDPOINTS.relayStart, { confirm: true })));
    } catch (e) { setCfgEdit((c) => ({ ...c, err: e.message })); }
  };

  // —— 一键接入（准入审批）——
  const [enrollForm, setEnrollForm] = useState({ url: '', code: '' });
  const [manualMode, setManualMode] = useState(false);
  const doEnroll = () => {
    if (!enrollForm.url) return;
    void apply(() => call(RELAY_ENDPOINTS.relayEnroll, { url: enrollForm.url, code: enrollForm.code }));
  };
  const enrollActive = ['submitting', 'pending', 'approved'].includes(enroll.phase);
  const enrollStatusLine = (enroll.phase === 'idle' || !enroll.detail) ? null
    : enroll.phase === 'done' || enroll.phase === 'approved'
      ? h('div', { style: { ...S.ok, marginTop: 8 } }, '✓ ' + errText(enroll.detail))
      : h('div', { style: { marginTop: 8 } },
        h('div', { style: enrollActive ? S.warn : S.err }, errText(enroll.detail)),
        enrollActive ? h('button', { style: { ...S.mini, marginTop: 6 }, onClick: () => apply(() => call(RELAY_ENDPOINTS.relayEnrollCancel, {})) }, t('cancelEnroll')) : null);
  const enrollFormBlock = h('div', null,
    h('div', { style: { fontWeight: 600, fontSize: 13, marginBottom: 8 } }, t('enrollTitle')),
    h('div', { style: S.field }, t('cfgStep1')),
    h('input', { style: S.input, placeholder: t('serverPlaceholder'), value: enrollForm.url, autoFocus: true,
      onChange: (e) => setEnrollForm((c) => ({ ...c, url: e.target.value.trim() })) }),
    h('div', { style: { ...S.field, marginTop: 8 } }, t('enrollCodeLabel')),
    h('input', { style: S.input, placeholder: t('enrollCodePh'), value: enrollForm.code,
      onChange: (e) => setEnrollForm((c) => ({ ...c, code: e.target.value.trim() })) }),
    h('div', { style: { display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' } },
      h('button', { style: S.primary, disabled: busy || !enrollForm.url || enrollActive, onClick: doEnroll }, t('enrollBtn')),
      h('span', { style: S.muted }, t('enrollHint'))),
    enrollStatusLine);

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
      maskableUrl(cfg.url)),
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
        maskableUrl(st.relayUrl),
        h('div', { style: { ...S.muted, margin: '4px 0 10px' } }, t('qrHintWan')),
        h('button', { style: S.mini, onClick: () => copy(st.relayUrl) }, t('copy')),
        rs.server?.phone !== undefined ? h('div', { style: { ...S.muted, marginTop: 10 } }, tf('serverStats', { phone: rs.server.phone, idle: rs.server.idle ?? '—' })) : null,
        pinBlock('public', st.accessToken, st.publicPinCustom, t('pinDesc'))));
  }

  const toggleManual = h('div', { style: { marginTop: 10 } },
    h('button', { style: S.mini, onClick: () => setManualMode((m) => !m) },
      manualMode ? t('enrollBack') : t('manualToken')));

  const manualEntry = (manualMode || wanConfigured || cfgEdit)
    ? h('div', { style: { marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--dsw-alias-border-l2,#e5e7eb)' } },
      !manualMode && wanConfigured && !cfgEdit ? wanHead : null,
      cfgEdit ? wanEditForm : null,
      manualMode && !wanConfigured && !cfgEdit ? wanCfgForm : null)
    : null;

  const wanBlock = h('div', { style: S.card },
    !wanOn ? h('div', null, enrollFormBlock, toggleManual, manualEntry) : wanHead,
    wanOn && cfgEdit ? wanEditForm : null,
    !wanOn ? wanStart : null,
    wanOn ? wanQr : null);

  // ---------- 外接隧道（模式 B） ----------

  const [tools, setTools] = useState([]);
  const [tunnelErr, setTunnelErr] = useState(null);
  const [tform, setTform] = useState(null); // { tool, binPath, cfg: {…} } 本地编辑态
  const tformInit = useRef(false);
  useEffect(() => {
    if (!st || tformInit.current) return;
    tformInit.current = true;
    const tc = st.tunnelConfig ?? { tool: 'frp', binPath: '', config: {} };
    setTform({ tool: tc.tool, binPath: tc.binPath ?? '', cfg: { ...(tc.config ?? {}) } });
  }, [st]);

  const toolList = tools.length
    ? TOOL_ORDER.map((id) => tools.find((x) => x.id === id)).filter(Boolean)
    : TOOL_ORDER.map((id) => ({ id }));
  const curTool = toolList.find((x) => x.id === tform?.tool) ?? null;
  const setTcfg = (key, value) => setTform((c) => ({ ...c, cfg: { ...c.cfg, [key]: value } }));

  const field = (label, key, opts = {}) => h('div', { style: { marginTop: 8 } },
    h('div', { style: S.field }, label),
    h('input', { style: S.input, type: opts.type ?? 'text', placeholder: opts.ph ?? '', value: tform?.cfg?.[key] ?? '',
      onChange: (e) => setTcfg(key, e.target.value) }));
  const fieldArea = (label, key, ph) => h('div', { style: { marginTop: 8 } },
    h('div', { style: S.field }, label),
    h('textarea', { style: { ...S.input, minHeight: 90, fontFamily: 'ui-monospace,Menlo,monospace', resize: 'vertical' }, placeholder: ph ?? '', value: tform?.cfg?.[key] ?? '',
      onChange: (e) => setTcfg(key, e.target.value) }));
  const binPathField = h('div', { style: { marginTop: 8 } },
    h('div', { style: S.field }, t('fBinPath')),
    h('input', { style: { ...S.input, fontFamily: 'ui-monospace,Menlo,monospace' }, placeholder: '/usr/local/bin/frpc', value: tform?.binPath ?? '',
      onChange: (e) => setTform((c) => ({ ...c, binPath: e.target.value.trim() })) }));

  // frp 形态：rawToml 非空即 raw 视图；frpSel 记住用户显式选择的形态（rawToml 为空时也能停在 raw 视图）；
  // 切回表单形态时清掉 rawToml（否则 host 永远优先 raw）
  const [frpSel, setFrpSel] = useState(null);
  const frpMode = frpSel ?? (String(tform?.cfg?.rawToml ?? '').trim() ? 'raw'
    : (['http', 'https'].includes(tform?.cfg?.proxyType) ? tform.cfg.proxyType : 'tcp'));
  // 明文警示（安全矩阵）：frp tcp 形态；custom 且公网地址为 http://
  const formPlainWarn = (tform?.tool === 'frp' && frpMode === 'tcp')
    || (tform?.tool === 'custom' && String(tform?.cfg?.publicUrl ?? '').trim().startsWith('http://'));
  const runTool = st?.tunnelConfig?.tool ?? ts.tool;
  const runCf = st?.tunnelConfig?.config ?? {};
  const runPlainWarn = (runTool === 'frp' && !String(runCf.rawToml ?? '').trim() && (['tcp', '', undefined].includes(runCf.proxyType)))
    || (runTool === 'custom' && String(runCf.publicUrl ?? '').trim().startsWith('http://'));

  const toolChips = h('div', null,
    h('div', { style: { ...S.field, fontWeight: 600, marginTop: 4 } }, t('tunnelTool')),
    h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 } },
      toolList.map((td) => h('button', {
        key: td.id, title: td.reason ?? '',
        onClick: () => setTform((c) => ({ ...(c ?? { binPath: '', cfg: {} }), tool: td.id })),
        style: { ...S.mini, height: 28, padding: '0 10px', fontSize: 12, cursor: 'pointer',
          ...(tform?.tool === td.id ? { borderColor: 'var(--dsw-alias-brand-primary,#4f6ef7)', color: 'var(--dsw-alias-brand-primary,#4f6ef7)', fontWeight: 700 } : {}) } },
      td.label ?? td.id, ' ',
      td.id === 'custom' ? null : h('span', { style: { color: td.available ? 'var(--dsw-alias-state-success-primary,#16a34a)' : 'var(--dsw-alias-label-tertiary,#8b93a1)' } }, td.available ? '●' : '○')))));

  const toolDocs = curTool?.docs
    ? h('div', { style: { ...S.muted, marginTop: 8 } }, localeEn ? curTool.docs.en : curTool.docs.zh)
    : null;
  const toolDownload = curTool && !curTool.available && curTool.docs
    ? h('div', { style: { ...S.muted, marginTop: 6 } },
      `○ ${t('toolMissing')} · ${localeEn ? curTool.docs.download.en : curTool.docs.download.zh}`,
      curTool.docs.downloadUrl ? h('a', { href: curTool.docs.downloadUrl, target: '_blank', rel: 'noreferrer', style: { ...S.link, marginLeft: 6 } }, t('tunnelDownload')) : null)
    : null;

  const frpForm = h('div', null,
    h('div', { style: { marginTop: 8 } },
      h('div', { style: S.field }, t('fProxyType')),
      h('select', { style: { ...S.input, width: 'auto', marginTop: 4 }, value: frpMode,
        onChange: (e) => {
          const v = e.target.value;
          setFrpSel(v);
          if (v !== 'raw') setTform((c) => ({ ...c, cfg: { ...c.cfg, proxyType: v, rawToml: null } }));
        } },
        h('option', { value: 'tcp' }, t('fTcp')),
        h('option', { value: 'http' }, t('fHttp')),
        h('option', { value: 'https' }, t('fHttps')),
        h('option', { value: 'raw' }, t('fRaw')))),
    frpMode === 'raw'
      ? fieldArea(t('fRawToml'), 'rawToml')
      : h('div', null,
        field(t('fServerAddr'), 'serverAddr', { ph: 'frps.example.com 或 1.2.3.4' }),
        field(t('fServerPort'), 'serverPort', { ph: '7000' }),
        field(t('fToken'), 'token', { type: 'password', ph: t('tokenPlaceholder') }),
        frpMode === 'tcp'
          ? field(t('fRemotePort'), 'remotePort', { ph: t('fRemotePortPh') })
          : h('div', null,
            field(t('fCustomDomain'), 'customDomain', { ph: 'dsh.example.com' }),
            field(t('fSubdomain'), 'subdomain', { ph: 'dsh' }))));

  const tunnelForms = {
    frp: frpForm,
    cloudflared: h('div', null, field(t('fTokenCloud'), 'token', { type: 'password', ph: t('fTokenCloudPh') })),
    natapp: h('div', null, field(t('fAuthtoken'), 'authtoken', { type: 'password', ph: 'xxxxxxxx' })),
    custom: h('div', null,
      field(t('fCommand'), 'command', { ph: t('fCommandPh') }),
      fieldArea(t('fConfigTemplate'), 'configTemplate', 'local_port = {{port}}'),
      field(t('fConfigFileName'), 'configFileName', { ph: 'client.toml' }),
      field(t('fPublicUrl'), 'publicUrl', { ph: 'https://…' })),
  };

  const tunnelSavePayload = () => {
    const out = {};
    for (const [k, v] of Object.entries(tform?.cfg ?? {})) out[k] = (v === '' || v == null) ? null : v; // 空串=删除该字段
    return { tool: tform.tool, binPath: String(tform?.binPath ?? '').trim(), config: out };
  };
  const saveTunnelCfg = async () => call(RELAY_ENDPOINTS.tunnelSetConfig, tunnelSavePayload());
  const startTunnelFlow = async () => { await saveTunnelCfg(); return call(RELAY_ENDPOINTS.tunnelStart, { confirm: true }); };

  const [tAdvOpen, setTAdvOpen] = useState(false);
  const inletText = `127.0.0.1:${st?.tunnelInletPort ?? ''}`;
  const tunnelAdv = h('div', { style: { marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--dsw-alias-border-l2,#e5e7eb)' } },
    h('button', { style: S.mini, onClick: () => setTAdvOpen((v) => !v) }, (tAdvOpen ? '▾ ' : '▸ ') + t('advTunnel')),
    tAdvOpen ? h('div', { style: { marginTop: 8 } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        h('span', { style: { ...S.url, fontSize: 13 } }, st?.tunnelInletPort ? inletText : '—'),
        st?.tunnelInletPort ? h('button', { style: S.mini, onClick: () => copy(inletText) }, t('copy')) : null),
      h('div', { style: { ...S.muted, marginTop: 6 } }, t('advTunnelDesc'))) : null);

  const tunnelStatusLine = h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 } },
    h('span', { style: { width: 8, height: 8, borderRadius: '50%', background: TUNNEL_STATE_COLORS[ts.phase] ?? TUNNEL_STATE_COLORS.idle, flexShrink: 0 } }),
    h('span', { style: { fontSize: 12, color: 'var(--dsw-alias-label-secondary,#6b7280)' } },
      (ts.phase === 'running' ? t('tunnelStateRunning') : ts.phase === 'starting' ? t('tunnelStateStarting') : ts.phase === 'backoff' ? t('tunnelStateBackoff') : ts.phase === 'error' ? t('tunnelStateError') : t('tunnelStateIdle'))
      + (ts.detail ? ` · ${errText(ts.detail)}` : '')));

  const tunnelRunning = tunnelOn || ['starting', 'backoff'].includes(ts.phase);
  const tunnelBlock = h('div', { style: S.card },
    // 状态区：URL + 二维码 + 状态行 + 停止（运行/启动中/退避/报错时展示）
    (ts.phase !== 'idle' || tunnelOn) ? h('div', null,
      st?.tunnelUrl ? h('div', { style: { ...S.grid2, marginTop: 4 } },
        h('img', { src: st.tunnelQr, alt: 'QR', style: S.qr }),
        h('div', null,
          maskableUrl(st.tunnelUrl),
          h('div', { style: { ...S.muted, margin: '4px 0 10px' } }, t('qrHintWan')),
          h('button', { style: S.mini, onClick: () => copy(st.tunnelUrl) }, t('copy')),
          runPlainWarn ? h('div', { style: { ...S.warn, marginTop: 8 } }, '⚠ ' + (runTool === 'frp' ? t('warnPlainTcp') : t('warnPlainCustom'))) : null,
          pinBlock('public', st.accessToken, st.publicPinCustom, t('pinDesc')))) : null,
      tunnelStatusLine,
      ts.phase === 'backoff' && ts.attempts ? h('div', { style: { ...S.warn, marginTop: 6 } }, tf('retryInfo', { n: ts.attempts, s: ts.nextRetryAt ? Math.max(0, Math.ceil((ts.nextRetryAt - Date.now()) / 1000)) : '—' })) : null,
      h('div', { style: { display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' } },
        h('button', { style: { ...S.mini, ...S.danger }, disabled: busy, onClick: () => applyTunnel(() => call(RELAY_ENDPOINTS.tunnelStop, {})) }, t('stopRelay')),
        tunnelRunning ? h('span', { style: S.muted }, t('tunnelRunningHint')) : null),
      tunnelErr ? errOf(tunnelErr) : null) : null,
    // 配置区：未运行（或报错待修）时展示
    !tunnelRunning ? h('div', { style: (ts.phase !== 'idle' || tunnelOn) ? { marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--dsw-alias-border-l2,#e5e7eb)' } : null },
      tform ? h('div', null,
        toolChips,
        toolDocs,
        toolDownload,
        tunnelForms[tform.tool] ?? null,
        binPathField,
        formPlainWarn ? h('div', { style: { ...S.warn, marginTop: 10 } }, '⚠ ' + (tform.tool === 'frp' ? t('warnPlainTcp') : t('warnPlainCustom'))) : null,
        h('div', { style: { display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' } },
          h('button', { style: S.mini, disabled: busy, onClick: () => applyTunnel(saveTunnelCfg) }, t('tunnelSave')),
          h('button', { style: S.primary, disabled: busy, onClick: () => applyTunnel(startTunnelFlow) }, busy ? t('opening') : t('tunnelStart')),
          tunnelErr && !(ts.phase !== 'idle') ? errOf(tunnelErr) : null)) : null) : null,
    tunnelAdv);

  // ---------- 仅局域网行（外网通道状态摘要 + 一键全停） ----------
  const wanActiveMode = mode === 'relay' && wanOn ? 'relay' : mode === 'tunnel' && tunnelOn ? 'tunnel' : null;
  const lanSummaryRow = h('div', { style: { ...S.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 8, padding: '9px 14px' } },
    h('span', { style: S.muted },
      wanActiveMode === 'relay' ? t('lanSummaryRelay')
        : wanActiveMode === 'tunnel' ? t('lanSummaryTunnel')
        : t('lanSummaryOff')),
    wanActiveMode ? h('button', { style: { ...S.mini, ...S.danger }, disabled: busy,
      onClick: () => apply(async () => { await call(RELAY_ENDPOINTS.relayStop, {}); return call(RELAY_ENDPOINTS.tunnelStop, {}); }) }, t('stopAllWan')) : null);

  // ---------- 接入方式卡片（点击只切换视图；高亮 = 当前启用的方式） ----------
  const modeCard = (id, title, desc) => h('div', {
    role: 'button', tabIndex: 0,
    onClick: () => setView(id),
    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') setView(id); },
    style: { ...S.card, cursor: 'pointer', ...(mode === id ? { borderLeft: '3px solid var(--dsw-alias-brand-primary,#4f6ef7)', background: 'var(--dsw-alias-bg-layer-2,rgba(79,110,247,.06))' } : {}) } },
  h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 } },
    h('span', { style: { ...S.field, fontWeight: 700, fontSize: 13 } }, title),
    mode === id ? h('span', { style: { fontSize: 11, fontWeight: 700, color: 'var(--dsw-alias-brand-primary,#4f6ef7)', whiteSpace: 'nowrap' } }, `● ${t('modeActive')}`) : null),
  h('div', { style: { ...S.muted, marginTop: 4 } }, desc));

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

  const bannerStop = mode === 'relay' && wanOn
    ? h('button', { style: { ...S.mini, borderColor: 'rgba(255,255,255,.5)', color: '#fff', height: 28, fontSize: 12 }, onClick: () => apply(() => call(RELAY_ENDPOINTS.relayStop, {})) }, t('stopRelay'))
    : mode === 'tunnel' && (tunnelOn || ['starting', 'backoff', 'error'].includes(ts.phase))
      ? h('button', { style: { ...S.mini, borderColor: 'rgba(255,255,255,.5)', color: '#fff', height: 28, fontSize: 12 }, onClick: () => applyTunnel(() => call(RELAY_ENDPOINTS.tunnelStop, {})) }, t('stopRelay'))
      : null;

  return h('div', { style: S.wrap },
    h('div', { style: S.banner(bannerColor) },
      h('span', { style: S.dot() }),
      h('div', { style: { flex: 1 } },
        h('div', { style: { fontWeight: 700, fontSize: 15 } }, t('appTitle')),
        h('div', { style: { fontSize: 12, opacity: .9 } }, bannerText)),
      bannerStop),
    h('div', { style: S.body },
      h('div', { style: { ...S.muted, marginTop: -6, marginBottom: 4 } }, t('appSub')),
      mode === 'relay' && phase === 'reconnecting' && rs.attempts ? h('div', { style: { ...S.warn, marginBottom: 6 } }, tf('retryInfo', { n: rs.attempts, s: rs.nextRetryAt ? Math.max(0, Math.ceil((rs.nextRetryAt - Date.now()) / 1000)) : '—' })) : null,
      mode === 'tunnel' && ts.phase === 'backoff' && ts.attempts ? h('div', { style: { ...S.warn, marginBottom: 6 } }, tf('retryInfo', { n: ts.attempts, s: ts.nextRetryAt ? Math.max(0, Math.ceil((ts.nextRetryAt - Date.now()) / 1000)) : '—' })) : null,
      error ? h('div', { style: { ...S.err, marginBottom: 6 } }, t('errPrefix') + errText(error)) : null,
      h('div', { style: S.sectionLabel }, t('secAccess')),
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
        modeCard('relay', t('modeRelay'), t('modeRelayDesc')),
        modeCard('tunnel', t('modeTunnel'), t('modeTunnelDesc'))),
      h('div', { style: { marginTop: 8 } }, lanSummaryRow),
      h('div', { style: { marginTop: 8 } }, effView === 'relay' ? wanBlock : tunnelBlock),
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
