window.__ModuleLoader__.load({
  id: "dsh-relay",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    var React = require("react");
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// client/settings.jsx
var settings_exports = {};
__export(settings_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(settings_exports);
var import_react = require("react");

// client/api.js
var RELAY_RPC_CHANNEL = "/dsh-relay";
var RELAY_ENDPOINTS = Object.freeze({
  status: "relay.status",
  relayStart: "relay.start",
  relayStop: "relay.stop",
  relaySetConfig: "relay.setConfig",
  lanSetEnabled: "lan.setEnabled",
  lanAuthSetEnabled: "lanAuth.setEnabled",
  lanSetOverride: "lan.setOverride",
  pinSetCustom: "pin.setCustom",
  relayReset: "relay.reset",
  relayEnroll: "relay.enroll",
  relayEnrollCancel: "relay.enroll.cancel"
});
function redactStatus(s) {
  return {
    proxyRunning: s?.proxyRunning === true,
    proxyPort: s?.proxyPort ?? null,
    dshPort: s?.dshPort ?? null,
    lanUrl: s?.lanUrl ?? null,
    lanQr: s?.lanQr ?? null,
    lanCandidates: Array.isArray(s?.lanCandidates) ? s.lanCandidates : [],
    lanIpOverride: s?.lanIpOverride ?? "",
    lanEnabled: s?.lanEnabled !== false,
    lanAuthEnabled: s?.lanAuthEnabled !== false,
    relayRunning: s?.relayRunning === true,
    relayUrl: s?.relayUrl ?? null,
    relayQr: s?.relayQr ?? null,
    relayState: s?.relayState ?? { phase: "idle" },
    relayConfig: s?.relayConfig ?? { url: "", tokenSet: false },
    accessToken: s?.accessToken ?? null,
    lanToken: s?.lanToken ?? null,
    publicPinCustom: s?.publicPinCustom === true,
    lanPinCustom: s?.lanPinCustom === true,
    enroll: s?.enroll ?? { phase: "idle", detail: "" }
  };
}

// client/settings.jsx
var name = "dsh-relay";
var inject = ["connection", "slots", "locale"];
var zh = {
  localeTag: "zh",
  appTitle: "DSH Relay",
  appSub: "\u901A\u8FC7\u4F60\u81EA\u5DF1\u7684\u4E2D\u7EE7\u670D\u52A1\u7AEF\uFF0C\u4ECE\u4EFB\u4F55\u7F51\u7EDC\u8BBF\u95EE\u8FD9\u53F0\u7535\u8111\u4E0A\u7684 DSH",
  stReady: "\u5DF2\u8FDE\u63A5\u670D\u52A1\u7AEF \xB7 \u5916\u7F51\u53EF\u8BBF\u95EE",
  stConnecting: "\u6B63\u5728\u8FDE\u63A5\u670D\u52A1\u7AEF\u2026",
  stReconnecting: "\u8FDE\u63A5\u4E2D\u65AD\uFF0C\u81EA\u52A8\u91CD\u8FDE\u4E2D",
  stIdle: "\u672A\u5F00\u542F",
  stError: "\u8FDE\u63A5\u9519\u8BEF",
  openRelay: "\u5F00\u542F\u5916\u7F51\u8BBF\u95EE",
  stopRelay: "\u505C\u6B62",
  opening: "\u8FDE\u63A5\u4E2D\u2026",
  secWan: "\u5916\u7F51\u8BBF\u95EE\uFF08\u7ECF\u4E2D\u7EE7\u670D\u52A1\u7AEF\uFF09",
  secLan: "\u5C40\u57DF\u7F51\u76F4\u8FDE",
  cfgTitle: "\u8FDE\u63A5\u5230\u4F60\u7684\u670D\u52A1\u7AEF",
  cfgStep1: "\u2460 \u670D\u52A1\u7AEF\u5730\u5740",
  cfgStep2: "\u2461 \u670D\u52A1\u7AEF\u5BC6\u94A5\u4E32\uFF08\u5728\u670D\u52A1\u7AEF\u7BA1\u7406\u53F0\u751F\u6210/\u6279\u51C6\u63A5\u5165\u540E\u81EA\u52A8\u83B7\u5F97\uFF09",
  serverPlaceholder: "relay.example.com \u6216 1.2.3.4:8443",
  tokenPlaceholder: "RELAY_TOKEN \u7684\u503C",
  cfgSave: "\u4FDD\u5B58\u5E76\u8FDE\u63A5",
  cfgSaveOnly: "\u4FDD\u5B58",
  cfgEdit: "\u4FEE\u6539\u670D\u52A1\u7AEF",
  cfgCurrent: "\u5F53\u524D\u670D\u52A1\u7AEF",
  qrHintWan: "\u624B\u673A\u6D4F\u89C8\u5668\u6253\u5F00\u6B64\u5730\u5740\uFF08\u4EFB\u610F\u7F51\u7EDC\uFF09",
  qrHintLan: "\u624B\u673A\u8FDE\u540C\u4E00 WiFi \u626B\u7801\u76F4\u8FBE",
  wanOffHint: "\u5F00\u542F\u540E\uFF0C\u624B\u673A\u5728\u4EFB\u610F\u7F51\u7EDC\u90FD\u80FD\u901A\u8FC7\u4F60\u7684\u4E2D\u7EE7\u670D\u52A1\u7AEF\u8BBF\u95EE\u8FD9\u91CC\u3002",
  pinTitle: "\u8BBF\u95EE\u5BC6\u7801",
  pinDesc: "8 \u4F4D\u5B57\u6BCD/\u6570\u5B57\uFF1B\u81EA\u5B9A\u4E49\u540E\u4E0D\u518D\u8F6E\u6362",
  lanPinDesc: "\u5C40\u57DF\u7F51\u5165\u53E3\u7684\u72EC\u7ACB\u5BC6\u7801",
  lanSwitch: "\u5C40\u57DF\u7F51\u5165\u53E3",
  lanAuthSwitch: "\u5C40\u57DF\u7F51\u5BC6\u7801",
  lanOff: "\u5C40\u57DF\u7F51\u5165\u53E3\u5DF2\u5173\u95ED",
  serverStats: "\u670D\u52A1\u7AEF\u5B9E\u65F6\uFF1A{phone} \u53F0\u8BBE\u5907\u5728\u7EBF \xB7 \u96A7\u9053\u6C60\u7A7A\u95F2 {idle}",
  retryInfo: "\u7B2C {n} \u6B21\u91CD\u8BD5 \xB7 \u7EA6 {s} \u79D2\u540E\u81EA\u52A8\u91CD\u8BD5",
  adv: "\u9AD8\u7EA7",
  advAddress: "\u5C40\u57DF\u7F51\u5730\u5740",
  enrollTitle: "\u4E00\u952E\u63A5\u5165\uFF08\u63A8\u8350\uFF09",
  enrollCodeLabel: "\u9080\u8BF7\u7801\uFF08\u670D\u52A1\u7AEF\u5F00\u542F\u65F6\u5FC5\u586B\uFF09",
  enrollCodePh: "\u6CA1\u6709\u53EF\u7559\u7A7A",
  enrollBtn: "\u7533\u8BF7\u63A5\u5165",
  enrollHint: "\u7BA1\u7406\u5458\u5728\u670D\u52A1\u7AEF\u7BA1\u7406\u53F0\u6279\u51C6\u540E\u81EA\u52A8\u5B8C\u6210\u914D\u7F6E\uFF0C\u65E0\u9700\u590D\u5236\u5BC6\u94A5\u4E32",
  enrollBack: "\u2190 \u8FD4\u56DE\u4E00\u952E\u63A5\u5165",
  manualToken: "\u624B\u52A8\u586B\u5199 Token\uFF08\u9AD8\u7EA7\uFF09",
  cancelEnroll: "\u53D6\u6D88\u7533\u8BF7",
  auto: "\u81EA\u52A8\u9009\u62E9",
  reset: "\u6062\u590D\u51FA\u5382",
  resetDesc: "\u6E05\u7A7A\u672C\u63D2\u4EF6\u5168\u90E8\u8BBE\u7F6E\u5E76\u91CD\u7F6E\u5BC6\u7801\uFF08\u4E0D\u5F71\u54CD DSH \u5176\u5B83\u6570\u636E\uFF09",
  resetTitle: "\u6062\u590D\u51FA\u5382\u8BBE\u7F6E\uFF1F",
  resetBody: "\u670D\u52A1\u7AEF\u5730\u5740\u3001Token\u3001\u5F00\u5173\u4E0E\u81EA\u5B9A\u4E49\u5BC6\u7801\u90FD\u4F1A\u88AB\u6E05\u7A7A\uFF0C\u5BC6\u7801\u91CD\u7F6E\u540E\u624B\u673A\u9700\u8981\u91CD\u65B0\u8F93\u5165\u3002",
  confirm: "\u786E\u8BA4",
  cancel: "\u53D6\u6D88",
  copy: "\u590D\u5236",
  errPrefix: "\u51FA\u9519\u4E86\uFF1A"
};
var en = {
  localeTag: "en",
  appTitle: "DSH Relay",
  appSub: "Reach the DSH on this computer from anywhere via your own relay server",
  stReady: "Connected \xB7 internet access active",
  stConnecting: "Connecting to relay server\u2026",
  stReconnecting: "Connection lost, reconnecting",
  stIdle: "Off",
  stError: "Connection error",
  openRelay: "Enable internet access",
  stopRelay: "Stop",
  opening: "Connecting\u2026",
  secWan: "Internet (via relay server)",
  secLan: "LAN direct",
  cfgTitle: "Connect to your relay server",
  cfgStep1: "\u2460 Server address",
  cfgStep2: "\u2461 Server secret (from admin console or auto-issued on approval)",
  serverPlaceholder: "relay.example.com or 1.2.3.4:8443",
  tokenPlaceholder: "value of RELAY_TOKEN",
  cfgSave: "Save & connect",
  cfgSaveOnly: "Save",
  cfgEdit: "Edit server",
  cfgCurrent: "Server",
  qrHintWan: "Open on your phone (any network)",
  qrHintLan: "Same Wi-Fi: scan to open",
  wanOffHint: "Once enabled, your phone can reach this DSH through your relay server from anywhere.",
  pinTitle: "Access PIN",
  pinDesc: "8 letters/digits; fixed once customized",
  lanPinDesc: "Separate PIN for the LAN entry",
  lanSwitch: "LAN entry",
  lanAuthSwitch: "LAN PIN",
  lanOff: "LAN entry is disabled",
  serverStats: "Server live: {phone} device(s) online \xB7 pool idle {idle}",
  retryInfo: "retry #{n} in ~{s}s",
  adv: "Advanced",
  advAddress: "LAN address",
  enrollTitle: "One-click join (recommended)",
  enrollCodeLabel: "Invite code (if required by the server)",
  enrollCodePh: "leave empty if none",
  enrollBtn: "Request access",
  enrollHint: "Approve it in the server admin console \u2014 no secret copy-paste needed",
  enrollBack: "\u2190 Back to one-click join",
  manualToken: "Enter token manually (advanced)",
  cancelEnroll: "Cancel request",
  auto: "Auto",
  reset: "Factory reset",
  resetDesc: "Clears all plugin settings and resets PINs (DSH data untouched)",
  resetTitle: "Factory reset?",
  resetBody: "Server address, token, switches and custom PINs will be cleared; phones must sign in again.",
  confirm: "Confirm",
  cancel: "Cancel",
  copy: "Copy",
  errPrefix: "Error: "
};
var S = {
  wrap: { background: "var(--dsw-alias-bg-layer-1,#fff)", border: "1px solid var(--dsw-alias-border-l2,#e5e7eb)", borderRadius: 14, overflow: "hidden" },
  banner: (color) => ({ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", background: color, color: "#fff" }),
  dot: () => ({ width: 10, height: 10, borderRadius: "50%", background: "#fff", boxShadow: "0 0 0 3px rgba(255,255,255,.25)", flexShrink: 0 }),
  body: { padding: "14px 18px 18px" },
  sectionLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "var(--dsw-alias-label-tertiary,#8b93a1)", textTransform: "uppercase", margin: "18px 0 8px" },
  card: { border: "1px solid var(--dsw-alias-border-l2,#e5e7eb)", borderRadius: 10, padding: "12px 14px" },
  field: { fontSize: 12, color: "var(--dsw-alias-label-secondary,#6b7280)" },
  input: { font: "inherit", display: "block", width: "100%", boxSizing: "border-box", padding: "8px 10px", fontSize: 13, border: "1px solid var(--dsw-alias-border-l2,#d1d5db)", borderRadius: 8, outline: "none", marginTop: 4, background: "var(--dsw-alias-bg-layer-1,#fff)", color: "inherit" },
  primary: { font: "inherit", cursor: "pointer", border: "none", background: "var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#4f6ef7))", color: "#fff", height: 34, padding: "0 18px", borderRadius: 8, fontSize: 13, fontWeight: 600 },
  mini: { font: "inherit", cursor: "pointer", border: "1px solid var(--dsw-alias-border-l2,#d1d5db)", background: "transparent", color: "inherit", height: 24, padding: "0 8px", borderRadius: 6, fontSize: 11 },
  danger: { color: "var(--dsw-alias-state-error-primary,#dc2626)" },
  url: { font: "600 15px ui-monospace,Menlo,monospace", wordBreak: "break-all", color: "var(--dsw-alias-label-primary,inherit)" },
  pin: { font: "16px ui-monospace,Menlo,monospace", letterSpacing: 3 },
  muted: { color: "var(--dsw-alias-label-tertiary,#8b93a1)", fontSize: 12, lineHeight: 1.5 },
  qr: { width: 132, height: 132, borderRadius: 8, display: "block" },
  grid2: { display: "grid", gridTemplateColumns: "132px 1fr", gap: 14, alignItems: "start" },
  warn: { color: "var(--dsw-alias-state-warn-primary,#b45309)", fontSize: 12 },
  err: { color: "var(--dsw-alias-state-error-primary,#dc2626)", fontSize: 12 }
};
var STATE_COLORS = { ready: "#16a34a", connecting: "#d97706", reconnecting: "#d97706", error: "#dc2626", idle: "#6b7280" };
function Switch(on, onClick) {
  return (0, import_react.createElement)(
    "button",
    { role: "switch", "aria-checked": !!on, onClick, style: { flexShrink: 0, width: 38, height: 20, borderRadius: 10, border: "none", padding: 0, position: "relative", cursor: "pointer", font: "inherit", background: on ? "var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#4f6ef7))" : "var(--dsw-alias-border-l2,#d1d5db)" } },
    (0, import_react.createElement)("span", { style: { position: "absolute", top: 2, left: on ? 19 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff" } })
  );
}
function RelaySettingsTab({ rpcCall, t }) {
  const tf = (key, vars) => {
    let s = t(key);
    if (vars) for (const [k, v] of Object.entries(vars)) s = String(s).split(`{${k}}`).join(String(v));
    return s;
  };
  const [st, setSt] = (0, import_react.useState)(null);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [cfgEdit, setCfgEdit] = (0, import_react.useState)(null);
  const [pinEdit, setPinEdit] = (0, import_react.useState)(null);
  const [dialog, setDialog] = (0, import_react.useState)(null);
  const [error, setError] = (0, import_react.useState)(null);
  const [toast, setToast] = (0, import_react.useState)(null);
  const toastT = (0, import_react.useRef)(null);
  const showToast = (m) => {
    setToast(m);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 2e3);
  };
  const call = async (ep, payload) => {
    const r = await rpcCall(ep, payload);
    if (!r?.ok) throw new Error(r?.error?.message ?? "RPC failed");
    return r.value;
  };
  const poll = async () => {
    try {
      setSt(redactStatus(await call(RELAY_ENDPOINTS.status, {})));
    } catch {
    }
  };
  (0, import_react.useEffect)(() => {
    poll();
    const t2 = setInterval(poll, 3e3);
    return () => clearInterval(t2);
  }, []);
  const errText = (m) => {
    const s = String(m ?? "");
    const i = s.indexOf(" | ");
    return i < 0 ? s : (t("localeTag") === "en" ? s.slice(i + 3) : s.slice(0, i)).trim();
  };
  const apply2 = async (fn) => {
    setBusy(true);
    setError(null);
    try {
      setSt(redactStatus(await fn()));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const copy = (text) => {
    try {
      navigator.clipboard.writeText(text);
      showToast("\u2713");
    } catch {
    }
  };
  const phase = st?.relayState?.phase ?? "idle";
  const cfg = st?.relayConfig ?? { url: "", tokenSet: false };
  const rs = st?.relayState ?? {};
  const bannerText = phase === "ready" ? t("stReady") : phase === "reconnecting" ? t("stReconnecting") : phase === "connecting" ? t("stConnecting") : phase === "error" ? t("stError") : t("stIdle");
  const bannerColor = STATE_COLORS[phase] ?? STATE_COLORS.idle;
  const errOf = (m) => (0, import_react.createElement)("div", { style: S.err }, t("errPrefix") + errText(m));
  const savePin = async (which) => {
    try {
      setSt(redactStatus(await call(RELAY_ENDPOINTS.pinSetCustom, { which, value: pinEdit?.value ?? "" })));
      setPinEdit(null);
    } catch (e) {
      setPinEdit((c) => ({ ...c, err: e.message }));
    }
  };
  const pinBlock = (which, value, custom, desc) => (0, import_react.createElement)(
    "div",
    { style: { marginTop: 10 } },
    (0, import_react.createElement)(
      "div",
      { style: { display: "flex", alignItems: "baseline", justifyContent: "space-between" } },
      (0, import_react.createElement)("span", { style: { ...S.field, fontWeight: 600 } }, t("pinTitle")),
      custom ? (0, import_react.createElement)("span", { style: S.muted }, "\u2713") : null
    ),
    (0, import_react.createElement)("div", { style: S.muted }, desc),
    pinEdit?.which === which ? (0, import_react.createElement)(
      "div",
      { style: { display: "flex", gap: 6, marginTop: 6, alignItems: "center" } },
      (0, import_react.createElement)("input", {
        style: { ...S.input, width: 120, marginTop: 0, textAlign: "center", letterSpacing: 3, fontSize: 15 },
        maxLength: 8,
        autoFocus: true,
        value: pinEdit.value ?? "",
        onChange: (e) => setPinEdit((c) => ({ ...c, value: e.target.value.replace(/[^a-zA-Z0-9]/g, "") })),
        onKeyDown: (e) => {
          if (e.key === "Enter") savePin(which);
          if (e.key === "Escape") setPinEdit(null);
        }
      }),
      (0, import_react.createElement)("button", { style: S.mini, onClick: () => savePin(which) }, "\u2713"),
      (0, import_react.createElement)("button", { style: S.mini, onClick: () => setPinEdit(null) }, "\u2715"),
      pinEdit.err ? errOf(pinEdit.err) : null
    ) : (0, import_react.createElement)(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 6 } },
      (0, import_react.createElement)("span", { style: S.pin }, value ?? "\xB7\xB7\xB7\xB7\xB7\xB7\xB7\xB7"),
      (0, import_react.createElement)("button", { style: S.mini, onClick: () => setPinEdit({ which, value: "" }) }, t("customize")),
      which === "lan" ? null : (0, import_react.createElement)("span", { style: S.muted }, t("pinDesc"))
    )
  );
  const saveCfg = async (andStart) => {
    try {
      setSt(redactStatus(await call(RELAY_ENDPOINTS.relaySetConfig, { url: cfgEdit?.url ?? "", token: cfgEdit?.token ?? "" })));
      setCfgEdit(null);
      if (andStart) setSt(redactStatus(await call(RELAY_ENDPOINTS.relayStart, { confirm: true })));
    } catch (e) {
      setCfgEdit((c) => ({ ...c, err: e.message }));
    }
  };
  const wanOn = st?.relayRunning === true;
  const wanConfigured = Boolean(cfg.url);
  const enroll = st?.enroll ?? { phase: "idle", detail: "" };
  const [enrollForm, setEnrollForm] = (0, import_react.useState)({ url: "", code: "" });
  const [manualMode, setManualMode] = (0, import_react.useState)(false);
  const doEnroll = () => {
    if (!enrollForm.url) return;
    void apply2(() => call(RELAY_ENDPOINTS.relayEnroll, { url: enrollForm.url, code: enrollForm.code }));
  };
  const enrollActive = ["submitting", "pending", "approved"].includes(enroll.phase);
  const enrollStatusLine = enroll.phase === "idle" || !enroll.detail ? null : enroll.phase === "done" || enroll.phase === "approved" ? (0, import_react.createElement)("div", { style: { color: "var(--dsw-alias-state-success-primary,#16a34a)", fontSize: 12, marginTop: 8 } }, "\u2713 " + errText(enroll.detail)) : (0, import_react.createElement)(
    "div",
    { style: { marginTop: 8 } },
    (0, import_react.createElement)("div", { style: enrollActive ? S.warn : S.err }, errText(enroll.detail)),
    enrollActive ? (0, import_react.createElement)("button", { style: { ...S.mini, marginTop: 6 }, onClick: () => apply2(() => call(RELAY_ENDPOINTS.relayEnrollCancel, {})) }, t("cancelEnroll")) : null
  );
  const enrollFormBlock = (0, import_react.createElement)(
    "div",
    null,
    (0, import_react.createElement)("div", { style: { fontWeight: 600, fontSize: 13, marginBottom: 8 } }, t("enrollTitle")),
    (0, import_react.createElement)("div", { style: S.field }, t("cfgStep1")),
    (0, import_react.createElement)("input", {
      style: S.input,
      placeholder: t("serverPlaceholder"),
      value: enrollForm.url,
      autoFocus: true,
      onChange: (e) => setEnrollForm((c) => ({ ...c, url: e.target.value.trim() }))
    }),
    (0, import_react.createElement)("div", { style: { ...S.field, marginTop: 8 } }, t("enrollCodeLabel")),
    (0, import_react.createElement)("input", {
      style: S.input,
      placeholder: t("enrollCodePh"),
      value: enrollForm.code,
      onChange: (e) => setEnrollForm((c) => ({ ...c, code: e.target.value.trim() }))
    }),
    (0, import_react.createElement)(
      "div",
      { style: { display: "flex", gap: 8, marginTop: 12, alignItems: "center", flexWrap: "wrap" } },
      (0, import_react.createElement)("button", { style: S.primary, disabled: busy || !enrollForm.url || enrollActive, onClick: doEnroll }, t("enrollBtn")),
      (0, import_react.createElement)("span", { style: S.muted }, t("enrollHint"))
    ),
    enrollStatusLine
  );
  const wanCfgForm = (0, import_react.createElement)(
    "div",
    null,
    (0, import_react.createElement)("div", { style: { fontWeight: 600, fontSize: 13, marginBottom: 8 } }, t("cfgTitle")),
    (0, import_react.createElement)("div", { style: S.field }, t("cfgStep1")),
    (0, import_react.createElement)("input", {
      style: S.input,
      placeholder: t("serverPlaceholder"),
      value: cfgEdit?.url ?? "",
      autoFocus: true,
      onChange: (e) => setCfgEdit((c) => ({ ...c, url: e.target.value.trim() }))
    }),
    (0, import_react.createElement)("div", { style: { ...S.field, marginTop: 10 } }, t("cfgStep2")),
    (0, import_react.createElement)("input", {
      style: { ...S.input, fontFamily: "ui-monospace,Menlo,monospace" },
      type: "password",
      placeholder: t("tokenPlaceholder"),
      value: cfgEdit?.token ?? "",
      onChange: (e) => setCfgEdit((c) => ({ ...c, token: e.target.value.trim() }))
    }),
    (0, import_react.createElement)(
      "div",
      { style: { display: "flex", gap: 8, marginTop: 12 } },
      (0, import_react.createElement)("button", { style: S.primary, disabled: busy, onClick: () => saveCfg(true) }, busy ? t("opening") : t("cfgSave"))
    )
  );
  const wanHead = (0, import_react.createElement)(
    "div",
    { style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 } },
    (0, import_react.createElement)(
      "div",
      null,
      (0, import_react.createElement)("div", { style: { ...S.field, fontWeight: 600 } }, t("cfgCurrent")),
      (0, import_react.createElement)("div", { style: S.url }, cfg.url || "\u2014")
    ),
    (0, import_react.createElement)("button", { style: S.mini, onClick: () => setCfgEdit({ url: cfg.url ?? "", token: "", err: null }) }, t("cfgEdit"))
  );
  const wanEditForm = (0, import_react.createElement)(
    "div",
    { style: { marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--dsw-alias-border-l2,#e5e7eb)" } },
    (0, import_react.createElement)("div", { style: S.field }, t("cfgStep1")),
    (0, import_react.createElement)("input", { style: S.input, value: cfgEdit?.url ?? "", onChange: (e) => setCfgEdit((c) => ({ ...c, url: e.target.value.trim() })) }),
    (0, import_react.createElement)("div", { style: { ...S.field, marginTop: 8 } }, t("cfgStep2")),
    (0, import_react.createElement)("input", { style: { ...S.input, fontFamily: "ui-monospace,Menlo,monospace" }, type: "password", placeholder: cfg.tokenSet ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : t("tokenPlaceholder"), value: cfgEdit?.token ?? "", onChange: (e) => setCfgEdit((c) => ({ ...c, token: e.target.value.trim() })) }),
    (0, import_react.createElement)(
      "div",
      { style: { display: "flex", gap: 8, marginTop: 10, alignItems: "center" } },
      (0, import_react.createElement)("button", { style: S.mini, onClick: () => saveCfg(false) }, t("cfgSaveOnly")),
      (0, import_react.createElement)("button", { style: S.mini, onClick: () => setCfgEdit(null) }, t("cancel")),
      cfgEdit?.err ? errOf(cfgEdit.err) : null
    )
  );
  const wanStart = (0, import_react.createElement)(
    "div",
    { style: { marginTop: 12 } },
    (0, import_react.createElement)("div", { style: S.muted }, t("wanOffHint")),
    (0, import_react.createElement)("button", { style: { ...S.primary, marginTop: 8 }, disabled: busy, onClick: () => apply2(() => call(RELAY_ENDPOINTS.relayStart, { confirm: true })) }, busy ? t("opening") : t("openRelay"))
  );
  let wanQr = null;
  if (wanOn && st?.relayUrl) {
    wanQr = (0, import_react.createElement)(
      "div",
      { style: { ...S.grid2, marginTop: 12 } },
      (0, import_react.createElement)("img", { src: st.relayQr, alt: "QR", style: S.qr }),
      (0, import_react.createElement)(
        "div",
        null,
        (0, import_react.createElement)("div", { style: S.url }, st.relayUrl),
        (0, import_react.createElement)("div", { style: { ...S.muted, margin: "4px 0 10px" } }, t("qrHintWan")),
        (0, import_react.createElement)("button", { style: S.mini, onClick: () => copy(st.relayUrl) }, t("copy")),
        rs.server?.phone !== void 0 ? (0, import_react.createElement)("div", { style: { ...S.muted, marginTop: 10 } }, tf("nasStats", { phone: rs.server.phone, idle: rs.server.idle ?? "\u2014" })) : null,
        pinBlock("public", st.accessToken, st.publicPinCustom, t("pinDesc"))
      )
    );
  }
  const toggleManual = (0, import_react.createElement)(
    "div",
    { style: { marginTop: 10 } },
    (0, import_react.createElement)(
      "button",
      { style: S.mini, onClick: () => setManualMode((m) => !m) },
      manualMode ? t("enrollBack") : t("manualToken")
    )
  );
  const manualEntry = manualMode || wanConfigured || cfgEdit ? (0, import_react.createElement)(
    "div",
    { style: { marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--dsw-alias-border-l2,#e5e7eb)" } },
    !manualMode && wanConfigured && !cfgEdit ? wanHead : null,
    cfgEdit ? wanEditForm : null,
    manualMode && !wanConfigured && !cfgEdit ? wanCfgForm : null
  ) : null;
  const wanBlock = (0, import_react.createElement)(
    "div",
    { style: S.card },
    !wanOn ? (0, import_react.createElement)("div", null, enrollFormBlock, toggleManual, manualEntry) : wanHead,
    wanOn && cfgEdit ? wanEditForm : null,
    !wanOn ? wanStart : null,
    wanOn ? wanQr : null
  );
  const lanBlock = (0, import_react.createElement)(
    "div",
    { style: S.card },
    st?.lanEnabled === false ? (0, import_react.createElement)(
      "div",
      { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
      (0, import_react.createElement)("span", { style: S.muted }, t("lanOff")),
      Switch(false, () => apply2(() => call(RELAY_ENDPOINTS.lanSetEnabled, { on: true })))
    ) : (0, import_react.createElement)(
      "div",
      null,
      (0, import_react.createElement)(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
        (0, import_react.createElement)("span", { style: { ...S.field, fontWeight: 600 } }, t("lanSwitch")),
        Switch(true, () => apply2(() => call(RELAY_ENDPOINTS.lanSetEnabled, { on: false })))
      ),
      st?.lanUrl ? (0, import_react.createElement)(
        "div",
        { style: { ...S.grid2, marginTop: 10 } },
        (0, import_react.createElement)("img", { src: st.lanQr, alt: "QR", style: S.qr }),
        (0, import_react.createElement)(
          "div",
          null,
          (0, import_react.createElement)("div", { style: { ...S.url, fontSize: 13 } }, st.lanUrl),
          (0, import_react.createElement)("div", { style: { ...S.muted, margin: "4px 0 8px" } }, t("qrHintLan")),
          (0, import_react.createElement)(
            "div",
            { style: { display: "flex", alignItems: "center", gap: 8 } },
            (0, import_react.createElement)("span", { style: { ...S.field, fontWeight: 600 } }, t("lanAuthSwitch")),
            Switch(st.lanAuthEnabled !== false, () => apply2(() => call(RELAY_ENDPOINTS.lanAuthSetEnabled, { on: st?.lanAuthEnabled === false })))
          ),
          st.lanAuthEnabled !== false ? pinBlock("lan", st.lanToken, st.lanPinCustom, t("lanPinDesc")) : null
        )
      ) : (0, import_react.createElement)("div", { style: S.muted }, "\u2026")
    )
  );
  const advBlock = (0, import_react.createElement)(
    "div",
    { style: S.card },
    (0, import_react.createElement)(
      "div",
      { style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 } },
      (0, import_react.createElement)("span", { style: { ...S.field, fontWeight: 600 } }, t("advAddress")),
      (0, import_react.createElement)(
        "select",
        { value: st?.lanIpOverride ?? "", style: { ...S.input, width: "auto", marginTop: 0 }, onChange: (e) => apply2(() => call(RELAY_ENDPOINTS.lanSetOverride, { ip: e.target.value })) },
        (0, import_react.createElement)("option", { value: "" }, t("auto")),
        (st?.lanCandidates ?? []).map((ip) => (0, import_react.createElement)("option", { key: ip, value: ip }, ip))
      )
    ),
    (0, import_react.createElement)(
      "div",
      { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--dsw-alias-border-l2,#e5e7eb)" } },
      (0, import_react.createElement)("span", { style: { ...S.field, fontWeight: 600, ...S.danger } }, t("reset")),
      (0, import_react.createElement)("button", { style: { ...S.mini, ...S.danger }, onClick: () => setDialog("reset") }, t("reset"))
    ),
    (0, import_react.createElement)("div", { style: S.muted }, t("resetDesc"))
  );
  return (0, import_react.createElement)(
    "div",
    { style: S.wrap },
    (0, import_react.createElement)(
      "div",
      { style: S.banner(bannerColor) },
      (0, import_react.createElement)("span", { style: S.dot() }),
      (0, import_react.createElement)(
        "div",
        { style: { flex: 1 } },
        (0, import_react.createElement)("div", { style: { fontWeight: 700, fontSize: 15 } }, t("appTitle")),
        (0, import_react.createElement)("div", { style: { fontSize: 12, opacity: 0.9 } }, bannerText)
      ),
      wanOn ? (0, import_react.createElement)("button", { style: { ...S.mini, borderColor: "rgba(255,255,255,.5)", color: "#fff", height: 28, fontSize: 12 }, onClick: () => apply2(() => call(RELAY_ENDPOINTS.relayStop, {})) }, t("stopRelay")) : null
    ),
    (0, import_react.createElement)(
      "div",
      { style: S.body },
      (0, import_react.createElement)("div", { style: { ...S.muted, marginTop: -6, marginBottom: 4 } }, t("appSub")),
      phase === "reconnecting" && rs.attempts ? (0, import_react.createElement)("div", { style: { ...S.warn, marginBottom: 6 } }, tf("retryInfo", { n: rs.attempts, s: rs.nextRetryAt ? Math.max(0, Math.ceil((rs.nextRetryAt - Date.now()) / 1e3)) : "\u2014" })) : null,
      error ? (0, import_react.createElement)("div", { style: { ...S.err, marginBottom: 6 } }, t("errPrefix") + errText(error)) : null,
      (0, import_react.createElement)("div", { style: S.sectionLabel }, t("secWan")),
      wanBlock,
      (0, import_react.createElement)("div", { style: S.sectionLabel }, t("secLan")),
      lanBlock,
      (0, import_react.createElement)("div", { style: S.sectionLabel }, t("adv")),
      advBlock
    ),
    dialog === "reset" ? (0, import_react.createElement)(
      "div",
      { style: { position: "fixed", inset: 0, zIndex: 1e4, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 } },
      (0, import_react.createElement)(
        "div",
        { style: { background: "var(--dsw-alias-bg-layer-1,#fff)", borderRadius: 12, maxWidth: 400, width: "100%", padding: "20px 22px" } },
        (0, import_react.createElement)("div", { style: { fontWeight: 700, fontSize: 15, marginBottom: 8 } }, t("resetTitle")),
        (0, import_react.createElement)("div", { style: { fontSize: 13, lineHeight: 1.6, color: "var(--dsw-alias-label-secondary,#6b7280)" } }, t("resetBody")),
        (0, import_react.createElement)(
          "div",
          { style: { display: "flex", gap: 8, marginTop: 16 } },
          (0, import_react.createElement)("button", { style: { ...S.mini, flex: 1, height: 34, fontSize: 13 }, onClick: () => setDialog(null) }, t("cancel")),
          (0, import_react.createElement)("button", { style: { ...S.primary, flex: 1, background: "var(--dsw-alias-state-error-primary,#dc2626)" }, onClick: async () => {
            setDialog(null);
            try {
              setSt(redactStatus(await call(RELAY_ENDPOINTS.relayReset, { confirm: true })));
              setCfgEdit(null);
              showToast("\u2713");
            } catch (e) {
              setError(e.message);
            }
          } }, t("confirm"))
        )
      )
    ) : null,
    toast ? (0, import_react.createElement)("div", { style: { position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 10001, background: "rgba(17,24,39,.92)", color: "#fff", borderRadius: 8, padding: "8px 14px", fontSize: 13 } }, toast) : null
  );
}
function apply(ctx) {
  if (ctx?.connection) {
    try {
      Object.defineProperty(ctx.connection, "isLoopback", { value: true, writable: true, configurable: true });
    } catch {
      try {
        ctx.connection.isLoopback = true;
      } catch {
      }
    }
  }
  const rpcCall = (endpoint, payload, signal) => ctx.connection.rpc.call(RELAY_RPC_CHANNEL, endpoint, payload, signal);
  let t = (key) => zh[key] ?? key;
  try {
    if (typeof ctx.locale?.register === "function" && typeof ctx.locale?.bind === "function") {
      ctx.locale.register("dsh-relay", { zh, en });
      ctx.effect(() => ctx.locale.register("dsh-relay", { zh, en }), "dsh-relay: locale dictionaries");
      const bound = ctx.locale.bind("dsh-relay");
      if (typeof bound === "function") t = bound;
    }
  } catch {
  }
  ctx.slots.inject("settings.section", () => ctx.slots.register(
    { name: "settings.section", id: "dsh-relay", order: 2, label: () => t("appTitle"), inject: () => ({ rpcCall, t }) },
    RelaySettingsTab
  ));
}

    return module.exports;
  }
});
