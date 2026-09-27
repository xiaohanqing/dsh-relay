# dsh-relay

[![CI](https://github.com/xiaohanqing/dsh-relay/actions/workflows/ci.yml/badge.svg)](https://github.com/xiaohanqing/dsh-relay/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**手机随时访问你自己的 DSH —— 流量走你自己的服务端，不依赖任何第三方云。**

Phone access to your own DeepSeek Harness (DSH) from anywhere — relayed through **your own server**, with no third-party cloud involved.

[English](#english) · 中文

---

## 为什么

常见的手机访问方案（Cloudflare Tunnel / 各种第三方穿透云）有两个问题：

1. **不稳定**——免费隧道掉线、国内访问 Cloudflare 边缘质量差，掉线后往往不会自动恢复；
2. **不放心**——DSH 能在你的电脑上执行代码，让一家第三方云做中间人，链路不掌握在自己手里。

dsh-relay 的思路：**中间人应该是你自己。** 任何一台有公网 IP 的机器（NAS、VPS、云主机都行）跑一个转发进程即可，它只做字节搬运，不碰你的业务数据。

```
手机(任意网络) ──https──▶ 服务端(dsh-relay-server) ◀──隧道(插件主动外连)── 电脑(dsh-relay 插件) ──▶ DSH
```

- 插件**永远主动外连**服务端：电脑侧不开任何入站端口，换 WiFi / 换网络无感
- 断线**秒级自动重连**（指数退避 + 心跳探活），重连策略完全自己可控
- 全链路三层门槛：服务端密钥串 + 电脑端 8 位访问密码 + 独立管理台密码
- 服务端只做字节搬运，不落任何业务数据，**重启即清**

## 功能

- **单服务端多客户端**——一台服务端同时带任意多台电脑，每台独立密钥串，互不可见
- **网页管理台**（`/__relay/admin`）——客户端列表与在线状态、待审批接入、身份档案
  （主机名 / 系统 / MAC / IP）、配置修改、事件日志，全程无需 SSH
- **准入审批**——新电脑填个服务端地址点「申请接入」，管理员在管理台点「批准」，
  密钥串自动下发并建立隧道，零复制粘贴；也可在页面上手动创建
- **密钥自动轮换**——默认 30 天，通过已认证通道无感推送新密钥，旧密钥 10 分钟宽限
- **局域网直连**——本地代理随插件启动，同一 WiFi 扫码即用，不经过服务端
- **自愈**——服务端重启、电脑重启、网络切换全部自动恢复，无人工干预

## 组成

| 包 | 说明 | 安装/部署 |
|---|---|---|
| [`packages/plugin`](packages/plugin) | DSH 插件 `dsh-relay`：本地反向代理 + 隧道客户端 + 设置页 | `dsh plugin --profile web add <本包路径>` |
| [`packages/server`](packages/server) | 服务端 `dsh-relay-server`：单端口 TLS 中继 + 管理台 | Docker：见[部署文档](docs/deploy-nas.md) |

## 快速开始

### 1. 服务端（约 5 分钟）

前提：任意能跑 Docker 的机器；有公网 IP（VPS 直接用；家宽配合 DDNS / 已有反向代理均可）。

```bash
cd packages/server
docker compose up -d --build
docker compose logs relay | grep "admin password"   # 管理台初始密码
```

浏览器打开 `http://<服务端地址>:8443/__relay/admin` 登录管理台（TLS 证书、
反向代理、端口转发的详细做法见 [docs/deploy-nas.md](docs/deploy-nas.md)）。

### 2. 电脑上装 DSH 插件

```bash
dsh plugin --profile web add /path/to/dsh-relay/packages/plugin
# 重启 dsh web 后，设置页会出现「DSH Relay」
```

### 3. 接入

DSH 设置页 → DSH Relay → 「一键接入」→ 填服务端地址 → 点「申请接入」→
回管理台批准 → 隧道自动建立，扫码即可。

也可以在管理台手动创建客户端、复制密钥串到插件（高级方式）。

## 文档

- [部署指南](docs/deploy-nas.md) —— 证书、DDNS、端口转发、nginx 反向代理、排障
- [协议规格](docs/protocol.md) —— 通信协议 v1.1（隧道 / 准入 / 轮换）
- [验收清单](docs/acceptance-checklist.md) —— 部署后逐项自检

## English

**dsh-relay** lets your phone reach your own DeepSeek Harness (DSH) from anywhere,
relayed through a server you control — no third-party tunnel cloud in the middle.

- **`packages/server`** — a single-port relay you deploy with Docker (on a NAS, VPS,
  any box with a public IP). Pure byte-forwarding: no storage, no admin surface beyond
  a password-protected console at `/__relay/admin`.
- **`packages/plugin`** — a DSH plugin that runs a local reverse proxy and keeps an
  outbound tunnel to the server (no inbound ports on your computer), with auto-reconnect
  and a QR-code LAN shortcut.

Highlights: multi-tenant (one server, many computers, isolated per-client secrets),
enrollment with admin approval (one-click join from the plugin settings page), automatic
secret rotation pushed over the authenticated channel, and a web admin console with
client identity cards (hostname / OS / MAC / IP) and an event log.

Quick start: `docker compose up -d --build` in `packages/server`, log into the admin
console, install the plugin, then use "One-click join" in the DSH settings page.
See [docs/](docs/) for details. MIT licensed.

## License

[MIT](LICENSE)
