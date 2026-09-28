// dsh-relay 设置页 RPC 契约（client 与 host 共享）
export const RELAY_RPC_CHANNEL = '/dsh-relay';

export const RELAY_ENDPOINTS = Object.freeze({
  status: 'relay.status',
  relayStart: 'relay.start',
  relayStop: 'relay.stop',
  relaySetConfig: 'relay.setConfig',
  lanSetEnabled: 'lan.setEnabled',
  lanAuthSetEnabled: 'lanAuth.setEnabled',
  lanSetOverride: 'lan.setOverride',
  pinSetCustom: 'pin.setCustom',
  relayReset: 'relay.reset',
  relayEnroll: 'relay.enroll',
  relayEnrollCancel: 'relay.enroll.cancel',
  tunnelStatus: 'tunnel.status',
  tunnelDetect: 'tunnel.detect',
  tunnelSetConfig: 'tunnel.setConfig',
  tunnelStart: 'tunnel.start',
  tunnelStop: 'tunnel.stop',
});

const MODES = ['relay', 'tunnel', 'lan'];
const TUNNEL_TOOLS = ['frp', 'cloudflared', 'natapp', 'custom'];
const TUNNEL_PHASES = ['idle', 'starting', 'running', 'backoff', 'error'];

/** status 的浏览器可见字段兜底。 */
export function redactStatus(s) {
  const ts = s?.tunnelState && typeof s.tunnelState === 'object' ? s.tunnelState : {};
  const tcfg = s?.tunnelConfig && typeof s.tunnelConfig === 'object' ? s.tunnelConfig : {};
  return {
    proxyRunning: s?.proxyRunning === true,
    proxyPort: s?.proxyPort ?? null,
    dshPort: s?.dshPort ?? null,
    // 接入方式；老 host 无 mode 字段时按运行中的通道推断
    mode: MODES.includes(s?.mode) ? s.mode : (s?.relayRunning === true ? 'relay' : 'lan'),
    lanUrl: s?.lanUrl ?? null,
    lanQr: s?.lanQr ?? null,
    lanCandidates: Array.isArray(s?.lanCandidates) ? s.lanCandidates : [],
    lanIpOverride: s?.lanIpOverride ?? '',
    lanEnabled: s?.lanEnabled !== false,
    lanAuthEnabled: s?.lanAuthEnabled !== false,
    relayRunning: s?.relayRunning === true,
    relayUrl: s?.relayUrl ?? null,
    relayQr: s?.relayQr ?? null,
    relayState: s?.relayState ?? { phase: 'idle' },
    relayConfig: s?.relayConfig ?? { url: '', tokenSet: false },
    // ---- 外接隧道 ----
    tunnelInletPort: Number(s?.tunnelInletPort) > 0 ? Number(s.tunnelInletPort) : null,
    tunnelRunning: s?.tunnelRunning === true,
    tunnelUrl: s?.tunnelUrl ?? null,
    tunnelQr: s?.tunnelQr ?? null,
    tunnelState: {
      phase: TUNNEL_PHASES.includes(ts.phase) ? ts.phase : 'idle',
      tool: typeof ts.tool === 'string' ? ts.tool : '',
      detail: typeof ts.detail === 'string' ? ts.detail : '',
      publicUrl: typeof ts.publicUrl === 'string' ? ts.publicUrl : '',
      attempts: Number.isFinite(ts.attempts) ? ts.attempts : 0,
      nextRetryAt: Number.isFinite(ts.nextRetryAt) ? ts.nextRetryAt : null,
      pid: ts.pid ?? null,
      logs: Array.isArray(ts.logs) ? ts.logs : [],
    },
    tunnelConfig: {
      tool: TUNNEL_TOOLS.includes(tcfg.tool) ? tcfg.tool : 'frp',
      binPath: typeof tcfg.binPath === 'string' ? tcfg.binPath : '',
      config: tcfg.config && typeof tcfg.config === 'object' ? tcfg.config : {},
    },
    accessToken: s?.accessToken ?? null,
    lanToken: s?.lanToken ?? null,
    publicPinCustom: s?.publicPinCustom === true,
    lanPinCustom: s?.lanPinCustom === true,
    enroll: s?.enroll ?? { phase: 'idle', detail: '' },
  };
}
