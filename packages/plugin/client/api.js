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
});

/** status 的浏览器可见字段兜底。 */
export function redactStatus(s) {
  return {
    proxyRunning: s?.proxyRunning === true,
    proxyPort: s?.proxyPort ?? null,
    dshPort: s?.dshPort ?? null,
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
    accessToken: s?.accessToken ?? null,
    lanToken: s?.lanToken ?? null,
    publicPinCustom: s?.publicPinCustom === true,
    lanPinCustom: s?.lanPinCustom === true,
  };
}
