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
  relayReset: "relay.reset"
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
    lanPinCustom: s?.lanPinCustom === true
  };
}

// client/settings.jsx
var name = "dsh-relay";
var inject = ["connection", "slots", "locale"];
var zh = {
  section: "DSH Relay",
  localeTag: "zh",
  title: "\u624B\u673A\u8BBF\u95EE\uFF08\u81EA\u5EFA\u4E2D\u7EE7\uFF09",
  subtitle: "\u5C40\u57DF\u7F51\u626B\u7801\u76F4\u8FDE\uFF1B\u5916\u7F51\u7ECF\u4F60\u81EA\u5DF1\u7684 NAS \u4E2D\u7EE7\uFF0C\u4E0D\u4F9D\u8D56\u7B2C\u4E09\u65B9\u4E91",
  lanAccess: "\u5C40\u57DF\u7F51\u8BBF\u95EE",
  lanPin: "\u5C40\u57DF\u7F51\u5BC6\u7801",
  lanAuthSwitch: "\u5BC6\u7801\u4FDD\u62A4",
  lanDisabledHint: "\u5C40\u57DF\u7F51\u8BBF\u95EE\u5DF2\u5173\u95ED\uFF0C\u626B\u7801/\u94FE\u63A5\u4E0D\u53EF\u7528",
  lanStarting: "\u6B63\u5728\u83B7\u53D6\u5C40\u57DF\u7F51\u5730\u5740\u2026",
  wanAccess: "NAS \u4E2D\u7EE7\uFF08\u5916\u7F51\u8BBF\u95EE\uFF09",
  enable: "\u5F00\u542F",
  opening: "\u5F00\u542F\u4E2D\u2026",
  stopRelay: "\u5173\u95ED",
  serverLabel: "\u670D\u52A1\u7AEF\u5730\u5740",
  tokenLabel: "Token",
  serverPlaceholder: "nas.example.com \u6216 nas.example.com:8443",
  tokenPlaceholder: "NAS \u4E0A RELAY_TOKEN \u7684\u503C",
  save: "\u4FDD\u5B58",
  cancel: "\u53D6\u6D88",
  edit: "\u4FEE\u6539",
  needCfg: "\u8BF7\u5148\u586B\u5199\u670D\u52A1\u7AEF\u5730\u5740\u548C Token",
  stateReady: "\u5DF2\u8FDE\u63A5 NAS\uFF0C\u5916\u7F51\u53EF\u8BBF\u95EE",
  stateReconnecting: "\u8FDE\u63A5\u65AD\u5F00\uFF0C\u6B63\u5728\u91CD\u8FDE\u2026",
  stateConnecting: "\u6B63\u5728\u8FDE\u63A5 NAS\u2026",
  stateIdle: "\u672A\u5F00\u542F",
  retryInfo: "\u7B2C {n} \u6B21\u91CD\u8BD5 \xB7 \u7EA6 {s} \u79D2\u540E",
  nasStats: "\u624B\u673A\u8FDE\u63A5\u6570 {phone} \xB7 \u6C60\u7A7A\u95F2 {idle}",
  pinLabel: "\u8BBF\u95EE\u5BC6\u7801",
  pinCustomHint: "\u5DF2\u81EA\u5B9A\u4E49",
  refresh: "\u5237\u65B0",
  customize: "\u81EA\u5B9A\u4E49",
  customizing: "\u8BBE\u7F6E\u4E3A",
  resetFactory: "\u6062\u590D\u51FA\u5382\u8BBE\u7F6E",
  resetGo: "\u91CD\u7F6E",
  resetIntro: "\u6E05\u7A7A\u672C\u63D2\u4EF6\u8BBE\u7F6E\u5E76\u91CD\u7F6E\u8BBF\u95EE\u5BC6\u7801\uFF0C\u4E0D\u5F71\u54CD DSH \u5176\u5B83\u6570\u636E",
  resetTitle: "\u786E\u8BA4\u6062\u590D\u51FA\u5382\u8BBE\u7F6E\uFF1F",
  resetBody: "\u5C06\u6E05\u7A7A\u670D\u52A1\u7AEF\u5730\u5740\u3001Token\u3001\u5F00\u5173\u4E0E\u81EA\u5B9A\u4E49\u5BC6\u7801\uFF0C\u5E76\u91CD\u7F6E\u8BBF\u95EE\u5BC6\u7801\u3002\u624B\u673A\u9700\u8981\u91CD\u65B0\u8F93\u5165\u5BC6\u7801\u3002",
  confirm: "\u786E\u8BA4",
  confirmRelay: "\u5F00\u542F\u5916\u7F51\u8BBF\u95EE\uFF1F",
  relayConfirmBody: "\u5916\u7F51\u5C06\u80FD\u901A\u8FC7\u4F60\u7684 NAS \u8BBF\u95EE\u8FD9\u53F0\u7535\u8111\u4E0A\u7684 DSH\uFF08\u53EF\u6267\u884C\u4EE3\u7801\uFF09\u3002\u8BF7\u786E\u4FDD\uFF1A\n1. NAS \u5DF2\u90E8\u7F72 dsh-relay-server \u4E14\u7AEF\u53E3\u672A\u5BF9\u516C\u7F51\u8BEF\u5F00\u653E\u5176\u5B83\u670D\u52A1\n2. \u8BBF\u95EE\u5BC6\u7801\u4E0D\u8981\u6CC4\u9732\uFF08\u4E8C\u7EF4\u7801\u5373\u94A5\u5319\uFF09",
  error: "\u9519\u8BEF\uFF1A{msg}",
  unknown: "\u672A\u77E5\u9519\u8BEF"
};
var en = {
  localeTag: "en",
  title: "Phone Access (Self-hosted Relay)",
  subtitle: "LAN via QR; internet via your own NAS relay \u2014 no third-party cloud",
  lanAccess: "LAN Access",
  lanPin: "LAN PIN",
  lanAuthSwitch: "PIN protection",
  lanDisabledHint: "LAN access is disabled",
  lanStarting: "Detecting LAN address\u2026",
  wanAccess: "NAS Relay (Internet)",
  enable: "Enable",
  opening: "Starting\u2026",
  stopRelay: "Stop",
  serverLabel: "Server address",
  tokenLabel: "Token",
  serverPlaceholder: "nas.example.com or nas.example.com:8443",
  tokenPlaceholder: "RELAY_TOKEN value from your NAS",
  save: "Save",
  cancel: "Cancel",
  edit: "Edit",
  needCfg: "Set the server address and token first",
  stateReady: "Connected \u2014 internet access active",
  stateReconnecting: "Connection lost, reconnecting\u2026",
  stateConnecting: "Connecting\u2026",
  stateIdle: "Off",
  retryInfo: "retry #{n} in ~{s}s",
  nasStats: "phone conns {phone} \xB7 pool idle {idle}",
  pinLabel: "Access PIN",
  pinCustomHint: "customized",
  refresh: "Refresh",
  customize: "Customize",
  customizing: "Set to",
  resetFactory: "Factory reset",
  resetGo: "Reset",
  resetIntro: "Clears plugin settings and resets PINs; DSH data is untouched",
  resetTitle: "Factory reset?",
  resetBody: "Clears the server address, token, switches and custom PINs, and resets access PINs. Phones must sign in again.",
  confirm: "Confirm",
  confirmRelay: "Enable internet access?",
  relayConfirmBody: "Your NAS will expose this computer's DSH (which can execute code) to the internet. Make sure:\n1. dsh-relay-server is deployed on the NAS and no other port is exposed\n2. Keep the PIN / QR code private",
  error: "Error: {msg}",
  unknown: "unknown error"
};
var styles = {
  card: { background: "var(--dsw-alias-bg-layer-1,#fff)", border: "1px solid var(--dsw-alias-border-l2,#e5e7eb)", borderRadius: 12, padding: "16px 20px", maxWidth: 480 },
  block: { borderTop: "1px solid var(--dsw-alias-border-l2,#e5e7eb)", marginTop: 14, paddingTop: 14 },
  muted: { color: "var(--dsw-alias-label-tertiary,#8b93a1)", fontSize: 12, lineHeight: 1.5 },
  code: { fontFamily: "ui-monospace,Menlo,monospace", fontSize: 12, wordBreak: "break-all", margin: "6px 0" },
  primary: { font: "inherit", cursor: "pointer", border: "none", background: "var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#4f6ef7))", color: "#fff", height: 32, padding: "0 14px", borderRadius: 999, fontSize: 13 },
  btn: { font: "inherit", cursor: "pointer", border: "1px solid var(--dsw-alias-border-l2,#d1d5db)", background: "var(--dsw-alias-bg-layer-1,#fff)", color: "inherit", height: 32, padding: "0 14px", borderRadius: 999, fontSize: 13 },
  danger: { color: "var(--dsw-alias-state-error-primary,#dc2626)" },
  warn: { color: "var(--dsw-alias-state-warn-primary,#b45309)", fontSize: 12, lineHeight: 1.5 },
  qr: { width: 200, height: 200, borderRadius: 10, border: "1px solid var(--dsw-alias-border-l2,#e5e7eb)", margin: "8px 0" },
  input: { font: "inherit", padding: "5px 9px", fontSize: 13, border: "1px solid var(--dsw-alias-border-l2,#d1d5db)", borderRadius: 6, outline: "none", margin: "4px 0 0 6px", width: 220 },
  switchWrap: { flexShrink: 0, width: 40, height: 22, borderRadius: 11, border: "none", padding: 0, position: "relative", cursor: "pointer", font: "inherit" }
};
function Switch(on, onClick) {
  return (0, import_react.createElement)(
    "button",
    { role: "switch", "aria-checked": !!on, style: { ...styles.switchWrap, background: on ? "var(--dsw-alias-button-primary-fill,var(--dsw-alias-brand-primary,#4f6ef7))" : "var(--dsw-alias-border-l2,#d1d5db)" }, onClick },
    (0, import_react.createElement)("span", { style: { position: "absolute", top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff" } })
  );
}
function RelaySettingsTab({ rpcCall, t }) {
  const tf = (key, vars) => {
    let s = t(key);
    if (vars) for (const [k, v] of Object.entries(vars)) s = String(s).split(`{${k}}`).join(String(v));
    return s;
  };
  const [status, setStatus] = (0, import_react.useState)(null);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(null);
  const [editing, setEditing] = (0, import_react.useState)(null);
  const [resetOpen, setResetOpen] = (0, import_react.useState)(false);
  const [confirmOpen, setConfirmOpen] = (0, import_react.useState)(false);
  const [customPin, setCustomPin] = (0, import_react.useState)(null);
  const [toast, setToast] = (0, import_react.useState)(null);
  const toastTimer = (0, import_react.useRef)(null);
  const showToast = (text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  };
  const call = async (endpoint, payload) => {
    const res = await rpcCall(endpoint, payload);
    if (!res?.ok) throw new Error(res?.error?.message ?? "RPC failed");
    return res.value;
  };
  const load = async () => {
    try {
      setStatus(redactStatus(await call(RELAY_ENDPOINTS.status, {})));
    } catch {
    }
  };
  (0, import_react.useEffect)(() => {
    load();
    const timer = setInterval(load, 3e3);
    return () => clearInterval(timer);
  }, []);
  const errText = (msg) => {
    const s = String(msg ?? "");
    const i = s.indexOf(" | ");
    const pick = i < 0 ? s : t("localeTag") === "en" ? s.slice(i + 3) : s.slice(0, i);
    return pick.trim();
  };
  const startRelay = async () => {
    setBusy(true);
    setError(null);
    try {
      setStatus(redactStatus(await call(RELAY_ENDPOINTS.relayStart, { confirm: true })));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const stopRelay = async () => {
    try {
      setStatus(redactStatus(await call(RELAY_ENDPOINTS.relayStop, {})));
    } catch {
    }
  };
  const saveConfig = async () => {
    try {
      setStatus(redactStatus(await call(RELAY_ENDPOINTS.relaySetConfig, { url: editing?.url ?? "", token: editing?.token ?? "" })));
      setEditing(null);
      showToast(t("save") + " \u2713");
    } catch (err) {
      setEditing((c) => ({ ...c, err: errText(err.message) }));
    }
  };
  const saveCustomPin = async (which) => {
    try {
      setStatus(redactStatus(await call(RELAY_ENDPOINTS.pinSetCustom, { which, value: customPin?.value ?? "" })));
      setCustomPin(null);
    } catch (err) {
      setCustomPin((c) => ({ ...c, err: errText(err.message) }));
    }
  };
  const doFactoryReset = async () => {
    setResetOpen(false);
    setBusy(true);
    try {
      setStatus(redactStatus(await call(RELAY_ENDPOINTS.relayReset, { confirm: true })));
      setEditing(null);
      setCustomPin(null);
      showToast("\u2713");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const relayState = status?.relayState ?? { phase: "idle" };
  const cfg = status?.relayConfig ?? { url: "", tokenSet: false };
  const row = (label, control, extra) => (0, import_react.createElement)(
    "div",
    { style: { borderTop: "1px solid var(--dsw-alias-border-l2,#e5e7eb)", paddingTop: 9, marginTop: 9 } },
    (0, import_react.createElement)("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } }, (0, import_react.createElement)("span", { style: { fontSize: 13 } }, label), control),
    extra ?? null
  );
  const qrArea = (src, url, hint) => (0, import_react.createElement)(
    "div",
    { style: { background: "var(--dsw-alias-bg-layer-2,#f3f4f6)", borderRadius: 10, padding: "10px 12px", textAlign: "center", margin: "10px 0" } },
    src ? (0, import_react.createElement)("img", { src, alt: "QR", style: styles.qr }) : null,
    (0, import_react.createElement)("div", { style: styles.code }, url),
    (0, import_react.createElement)("div", { style: styles.muted }, hint)
  );
  const pinRow = (which, label, value, custom) => row(
    label,
    customPin?.which === which ? null : (0, import_react.createElement)(
      "span",
      { style: { display: "inline-flex", alignItems: "center", gap: 8 } },
      (0, import_react.createElement)("span", { style: { fontFamily: "ui-monospace,Menlo,monospace", fontSize: 13, letterSpacing: 1 } }, value),
      (0, import_react.createElement)("button", { style: { ...styles.btn, height: 26, padding: "0 10px", fontSize: 12 }, onClick: () => setCustomPin({ which, value: "", err: null }) }, t("customize"))
    ),
    customPin?.which === which ? (0, import_react.createElement)(
      "div",
      { style: { marginTop: 6, fontSize: 12, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" } },
      t("customizing"),
      (0, import_react.createElement)("input", {
        style: { ...styles.input, width: 110, margin: 0, textAlign: "center", letterSpacing: 2 },
        type: "password",
        maxLength: 8,
        value: customPin.value ?? "",
        autoFocus: true,
        onChange: (e) => setCustomPin((c) => ({ ...c, value: e.target.value.replace(/[^a-zA-Z0-9]/g, ""), err: null })),
        onKeyDown: (e) => {
          if (e.key === "Enter") saveCustomPin(which);
          if (e.key === "Escape") setCustomPin(null);
        }
      }),
      (0, import_react.createElement)("button", { style: { ...styles.btn, height: 26, padding: "0 10px", fontSize: 12 }, onClick: () => saveCustomPin(which) }, t("save")),
      (0, import_react.createElement)("button", { style: { ...styles.btn, height: 26, padding: "0 10px", fontSize: 12 }, onClick: () => setCustomPin(null) }, t("cancel")),
      customPin?.err ? (0, import_react.createElement)("span", { style: styles.danger }, customPin.err) : null
    ) : custom ? (0, import_react.createElement)("div", { style: { ...styles.muted, marginTop: 4 } }, t("pinCustomHint")) : null
  );
  return (0, import_react.createElement)(
    "div",
    { style: styles.card },
    (0, import_react.createElement)(
      "div",
      null,
      (0, import_react.createElement)("strong", null, t("title")),
      (0, import_react.createElement)("div", { style: styles.muted }, t("subtitle"))
    ),
    // 局域网
    (0, import_react.createElement)(
      "div",
      { style: styles.block },
      (0, import_react.createElement)(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
        (0, import_react.createElement)("span", { style: { fontWeight: 600, fontSize: 13 } }, t("lanAccess")),
        Switch(status?.lanEnabled !== false, async () => {
          try {
            setStatus(redactStatus(await call(RELAY_ENDPOINTS.lanSetEnabled, { on: status?.lanEnabled === false })));
          } catch (err) {
            setError(err.message);
          }
        })
      ),
      status?.lanEnabled === false ? (0, import_react.createElement)("div", { style: { ...styles.warn, marginTop: 8 } }, t("lanDisabledHint")) : status?.lanUrl ? (0, import_react.createElement)(
        "div",
        null,
        qrArea(status.lanQr, status.lanUrl, "http \xB7 \u540C\u4E00\u5C40\u57DF\u7F51"),
        pinRow("lan", t("lanPin"), status.lanToken ?? "\u2014", status.lanPinCustom),
        row(t("lanAuthSwitch"), Switch(status?.lanAuthEnabled !== false, async () => {
          try {
            setStatus(redactStatus(await call(RELAY_ENDPOINTS.lanAuthSetEnabled, { on: status?.lanAuthEnabled === false })));
          } catch (err) {
            setError(err.message);
          }
        }))
      ) : (0, import_react.createElement)("div", { style: styles.muted }, t("lanStarting"))
    ),
    // NAS 中继
    (0, import_react.createElement)(
      "div",
      { style: styles.block },
      (0, import_react.createElement)(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
        (0, import_react.createElement)("span", { style: { fontWeight: 600, fontSize: 13 } }, t("wanAccess")),
        status?.relayRunning ? (0, import_react.createElement)("button", { style: { ...styles.btn, ...styles.danger, height: 28, padding: "0 12px", fontSize: 12 }, onClick: stopRelay }, t("stopRelay")) : (0, import_react.createElement)("button", { style: { ...styles.primary, height: 28, padding: "0 14px", fontSize: 12 }, disabled: busy, onClick: () => setConfirmOpen(true) }, busy ? t("opening") : t("enable"))
      ),
      relayState.phase === "reconnecting" ? (0, import_react.createElement)(
        "div",
        { style: { marginTop: 8, fontSize: 12, color: "#b45309" } },
        t("stateReconnecting"),
        relayState.attempts ? (0, import_react.createElement)("div", { style: styles.muted }, tf("retryInfo", { n: relayState.attempts, s: relayState.nextRetryAt ? Math.max(0, Math.ceil((relayState.nextRetryAt - Date.now()) / 1e3)) : "\u2014" })) : null
      ) : relayState.phase === "connecting" ? (0, import_react.createElement)("div", { style: { marginTop: 8, fontSize: 12, color: "#6b7280" } }, t("stateConnecting")) : relayState.phase === "error" ? (0, import_react.createElement)("div", { style: { marginTop: 8, fontSize: 12, ...styles.danger } }, t("error", { msg: errText(relayState.detail) || t("unknown") })) : null,
      status?.relayRunning ? (0, import_react.createElement)(
        "div",
        null,
        qrArea(status.relayQr, status.relayUrl, "https \xB7 \u4EFB\u610F\u7F51\u7EDC"),
        relayState.server?.phone !== void 0 ? (0, import_react.createElement)("div", { style: styles.muted }, tf("nasStats", { phone: relayState.server.phone, idle: relayState.server.idle ?? "\u2014" })) : null,
        pinRow("public", t("pinLabel"), status.accessToken ?? "\u2014", status.publicPinCustom)
      ) : (0, import_react.createElement)("div", { style: { marginTop: 8, ...styles.muted } }, t("stateIdle")),
      // 服务端配置（地址 + token）
      row(
        `${t("serverLabel")} / ${t("tokenLabel")}`,
        editing ? null : (0, import_react.createElement)(
          "span",
          { style: { display: "inline-flex", alignItems: "center", gap: 8 } },
          (0, import_react.createElement)("span", { style: { fontSize: 12, fontFamily: "ui-monospace,Menlo,monospace" } }, cfg.url || "\u2014"),
          (0, import_react.createElement)("button", { style: { ...styles.btn, height: 26, padding: "0 10px", fontSize: 12 }, onClick: () => setEditing({ url: cfg.url ?? "", token: "", err: null }) }, t("edit"))
        ),
        editing ? (0, import_react.createElement)(
          "div",
          { style: { marginTop: 6 } },
          (0, import_react.createElement)(
            "div",
            null,
            t("serverLabel"),
            (0, import_react.createElement)("input", {
              style: styles.input,
              placeholder: t("serverPlaceholder"),
              value: editing.url,
              autoFocus: true,
              onChange: (e) => setEditing((c) => ({ ...c, url: e.target.value.trim(), err: null })),
              onKeyDown: (e) => {
                if (e.key === "Escape") setEditing(null);
              }
            })
          ),
          (0, import_react.createElement)(
            "div",
            { style: { marginTop: 6 } },
            t("tokenLabel"),
            (0, import_react.createElement)("input", {
              style: { ...styles.input, fontFamily: "ui-monospace,Menlo,monospace" },
              type: "password",
              placeholder: editing?.token === null && cfg.tokenSet ? "\u2022\u2022\u2022\u2022\u2022\u2022" : t("tokenPlaceholder"),
              value: editing.token,
              onChange: (e) => setEditing((c) => ({ ...c, token: e.target.value.trim(), err: null })),
              onKeyDown: (e) => {
                if (e.key === "Enter") saveConfig();
                if (e.key === "Escape") setEditing(null);
              }
            })
          ),
          (0, import_react.createElement)(
            "div",
            { style: { marginTop: 8, display: "flex", gap: 8 } },
            (0, import_react.createElement)("button", { style: { ...styles.btn, height: 26, padding: "0 12px", fontSize: 12 }, onClick: saveConfig }, t("save")),
            (0, import_react.createElement)("button", { style: { ...styles.btn, height: 26, padding: "0 12px", fontSize: 12 }, onClick: () => setEditing(null) }, t("cancel"))
          ),
          editing.err ? (0, import_react.createElement)("div", { style: { ...styles.danger, marginTop: 4, fontSize: 12 } }, editing.err) : null
        ) : (0, import_react.createElement)("div", { style: { ...styles.muted, marginTop: 4 } }, cfg.tokenSet ? "Token \u2713" : t("needCfg"))
      )
    ),
    error ? (0, import_react.createElement)("div", { style: { ...styles.danger, fontSize: 12, marginTop: 8 } }, `\u274C ${errText(error)}`) : null,
    // 恢复出厂
    (0, import_react.createElement)(
      "div",
      { style: styles.block },
      (0, import_react.createElement)(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
        (0, import_react.createElement)("span", { style: { fontWeight: 600, fontSize: 13 } }, t("resetFactory")),
        (0, import_react.createElement)("button", { style: { ...styles.btn, height: 28, padding: "0 12px", fontSize: 12, ...styles.danger }, onClick: () => setResetOpen(true) }, t("resetGo"))
      ),
      (0, import_react.createElement)("div", { style: { ...styles.muted, marginTop: 6 } }, t("resetIntro"))
    ),
    // 确认弹框：开启外网
    confirmOpen ? (0, import_react.createElement)("div", { style: dialogMask() }, (0, import_react.createElement)(
      "div",
      { style: dialogCard() },
      (0, import_react.createElement)("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 10, color: "#b45309" } }, t("confirmRelay")),
      (0, import_react.createElement)("div", { style: { fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-line" } }, t("relayConfirmBody")),
      (0, import_react.createElement)(
        "div",
        { style: { display: "flex", gap: 8, marginTop: 16 } },
        (0, import_react.createElement)("button", { style: { ...styles.btn, flex: 1 }, onClick: () => setConfirmOpen(false) }, t("cancel")),
        (0, import_react.createElement)("button", { style: { ...styles.primary, flex: 1 }, onClick: () => {
          setConfirmOpen(false);
          startRelay();
        } }, t("confirm"))
      )
    )) : null,
    // 确认弹框：恢复出厂
    resetOpen ? (0, import_react.createElement)("div", { style: dialogMask() }, (0, import_react.createElement)(
      "div",
      { style: dialogCard() },
      (0, import_react.createElement)("div", { style: { fontWeight: 600, fontSize: 15, marginBottom: 10, color: "#b45309" } }, t("resetTitle")),
      (0, import_react.createElement)("div", { style: { fontSize: 13, lineHeight: 1.7 } }, t("resetBody")),
      (0, import_react.createElement)(
        "div",
        { style: { display: "flex", gap: 8, marginTop: 16 } },
        (0, import_react.createElement)("button", { style: { ...styles.btn, flex: 1 }, onClick: () => setResetOpen(false) }, t("cancel")),
        (0, import_react.createElement)("button", { style: { ...styles.primary, flex: 1, background: "var(--dsw-alias-state-error-primary,#dc2626)" }, onClick: doFactoryReset }, t("confirm"))
      )
    )) : null,
    toast ? (0, import_react.createElement)("div", { style: { position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 10001, background: "rgba(17,24,39,.92)", color: "#fff", borderRadius: 10, padding: "10px 16px", fontSize: 13 } }, toast) : null
  );
}
function dialogMask() {
  return { position: "fixed", inset: 0, zIndex: 1e4, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 };
}
function dialogCard() {
  return { background: "var(--dsw-alias-bg-layer-1,#fff)", borderRadius: 12, maxWidth: 420, width: "100%", padding: "20px 22px", boxShadow: "0 8px 32px rgba(0,0,0,.18)" };
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
    { name: "settings.section", id: "dsh-relay", order: 2, label: () => t("section"), inject: () => ({ rpcCall, t }) },
    RelaySettingsTab
  ));
}

    return module.exports;
  }
});
