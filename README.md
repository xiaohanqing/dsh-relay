# dsh-relay

[![CI](https://github.com/xiaohanqing/dsh-relay/actions/workflows/ci.yml/badge.svg)](https://github.com/xiaohanqing/dsh-relay/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

English | [简体中文](README.zh-CN.md)

Reach your own DeepSeek Harness (DSH) from your phone, wherever you are. The computer
running DSH keeps an outbound connection to an endpoint you control — a self-hosted
relay server, or a tunnel you already run (frp, cloudflared, natapp, …). No inbound
ports are opened on your computer, connections recover on their own after network
switches and reboots, and the man in the middle is you — not a tunnel cloud.

## How it works

```
Phone ──HTTPS──▶ Public entry                     Your computer (DSH)
                 (frps / cloudflared /               │ ▲ outbound tunnel,
                  your relay server)                 │ ▼ plugin dials out
                                  ─────────────────▶ dsh-relay plugin
                                                       local reverse proxy :3082
                                                         └─▶ DSH web (127.0.0.1:3080)
```

The plugin rewrites Host/Origin headers so DSH's loopback trust bar sees a local
client, handles the browser session handshake, keeps WebSockets alive across NAT, and
enforces an access PIN on every public path. Your phone sees the same UI as your
desktop, in real time.

## Features

- **Two ways to get a public entry**
  - *Bring your own tunnel* — reuse an frp server you (or a friend) already have, or
    go account-free with cloudflared quick tunnels; natapp for mainland China; a
    universal command template covers bore, rathole, and anything else
  - *Self-hosted relay server* — one Docker container; multi-tenant (many computers,
    isolated per-client secrets), web admin console, join-by-approval enrollment,
    automatic key rotation
  - *LAN only* — QR-code direct connection on the same WiFi, no tunnel at all
- **Self-healing** — bounded exponential-backoff reconnects (guarded by worst-case
  regression tests that watch RSS and reconnect rates), automatic recovery after
  server restarts, computer reboots, and network switches
- **Security in depth** — see [Security](#security)

## Two access modes compared

| | Bring-your-own tunnel | Self-hosted relay server |
|---|---|---|
| Deploy a server | No | Yes (one Docker container) |
| Who is the middleman | Whoever runs the tunnel entry: your frps (you), or the tunnel provider | You |
| Many computers, one entry | Depends on the tunnel tool | Yes — multi-tenant, isolated secrets |
| Admin console / approval / key rotation | — | Yes |
| Best for | One computer, zero extra deployment | Several computers under managed access |

## Quick start

Requirements: a running DSH web instance, and Node.js ≥ 22 with pnpm for development.

**1. Install the plugin** (on the computer running DSH) — one command, straight from GitHub:

```bash
dsh plugin --profile web add 'github:xiaohanqing/dsh-relay#path:packages/plugin'
# restart dsh web, then open Settings → DSH Relay
```

To upgrade later, run the same command again (or `dsh plugin --profile web update dsh-relay`).

**2a. Connect through a tunnel you already have** (most common path):

In the plugin settings, choose **Tunnel** as the access mode and pick your tool:

- **frp** — fill in the frps address, port, auth token, and remote port; the plugin
  generates `frpc.toml`, validates it with `frpc verify`, and supervises `frpc`
- **cloudflared** — quick tunnel: no account, get a temporary HTTPS URL instantly
- **natapp** — paste the tunnel authtoken from natapp.cn
- **Custom** — any command with `{{port}}` / `{{configFile}}` placeholders

Open the public URL (or scan the QR code) on your phone and enter the access PIN.

**2b. Or run your own relay server:**

```bash
cd packages/server
docker compose up -d --build
docker compose logs relay | grep "admin password"   # initial admin console password
```

Open `https://<server>:8443/__relay/admin`, then use **One-click join** in the plugin
settings and approve the request in the admin console. Details:
[docs/deploy-nas.md](docs/deploy-nas.md).

## Security

- **Three gates**: per-client relay tokens, an 8-character access PIN enforced on
  every public path (with rate-limited lockout), and a separate admin console password
- **Rotating secrets**: relay keys rotate automatically every 30 days with a 10-minute
  grace window; rotation is pushed over the already-authenticated channel
- **No storage**: the relay server forwards bytes and keeps no business data
- **Plaintext warning**: with an frp TCP mapping — or any `http://` entry — the leg
  between your phone and the public entry is plaintext, and the PIN travels over it.
  Prefer an entry that terminates TLS (cloudflared, natapp, or an HTTPS front end for
  frp); the trade-offs are laid out per tool in [docs/tunnel.md](docs/tunnel.md)

## Documentation

- [Tunnel mode guide](docs/tunnel.md) — every supported tool, what to fill in, security notes
- [Relay server deployment](docs/deploy-nas.md) — TLS certificates, DDNS, port forwarding, nginx
- [Protocol specification](docs/protocol.md) — tunnel protocol v1.1 (relay mode)
- [Acceptance checklist](docs/acceptance-checklist.md) — verify a deployment end to end
- Package READMEs: [plugin](packages/plugin) · [server](packages/server)

## License

[MIT](LICENSE)
