# dsh-relay

[![CI](https://github.com/xiaohanqing/dsh-relay/actions/workflows/ci.yml/badge.svg)](https://github.com/xiaohanqing/dsh-relay/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[English](README.md) | 简体中文

在手机上随时随地访问你自己的 DeepSeek Harness（DSH）。跑 DSH 的电脑始终**主动外连**
一个由你掌控的入口——自建中继服务端，或你已经在用的隧道（frp、cloudflared、natapp 等）。
电脑不开任何入站端口；断网、重启、换网络都自动恢复；中间人是你自己，而不是一家隧道云。

## 工作原理

```
手机 ──HTTPS──▶ 公网入口                      你的电脑（DSH）
                （frps / cloudflared /           │ ▲ 隧道，
                 你的中继服务端）                 │ ▼ 插件主动外连
                                ────────────────▶ dsh-relay 插件
                                                    本地反向代理 :3082
                                                      └─▶ DSH web（127.0.0.1:3080）
```

插件侧把 Host/Origin 等请求头改写为回环形态，让 DSH 的回环信任栅栏看到的是一个本机
客户端；同时处理浏览器会话握手、跨 NAT 保活 WebSocket，并在所有公网路径上强制访问
密码。手机看到的界面与电脑完全一致、实时同步。

## 功能

- **两种公网入口，随你选**
  - *外接隧道*——复用你（或朋友）已有的 frp 服务；cloudflared 快速隧道免账号即开；
    国内可用 natapp；万能命令模板覆盖 bore、rathole 以及其他任何隧道工具
  - *自建中继服务端*——一个 Docker 容器；多租户（多台电脑、密钥互相隔离）、
    网页管理台、申请审批接入、密钥自动轮换
  - *仅局域网*——同一 WiFi 扫码直连，完全不走隧道
- **全链路自愈**——有界指数退避重连（最坏路径回归测试盯守 RSS 与重连速率），
  服务端重启、电脑重启、网络切换后自动恢复
- **纵深安全**——见[安全](#安全)

## 两种接入方式对比

| | 外接隧道 | 自建中继服务端 |
|---|---|---|
| 要部署服务端吗 | 不用 | 要（一个 Docker 容器） |
| 中间人是谁 | 隧道入口的运营方：你的 frps（=你），或隧道服务商 | 你自己 |
| 一个入口带多台电脑 | 取决于隧道工具 | 支持——多租户，密钥互相隔离 |
| 管理台 / 审批 / 密钥轮换 | — | 支持 |
| 适合谁 | 一台电脑、零额外部署 | 多台电脑、需要统一管理 |

## 快速开始

前提：一台跑着 DSH web 的电脑；开发参与需要 Node.js ≥ 22 与 pnpm。

**1. 安装插件**（在跑 DSH 的电脑上）：

```bash
dsh plugin --profile web add /path/to/dsh-relay/packages/plugin
# 重启 dsh web，设置页出现「DSH Relay」
```

**2a. 复用已有的隧道**（大多数人的路径）：

在插件设置里把接入方式切到「外接隧道」，选择工具：

- **frp**——填 frps 地址、端口、token、远程端口；插件自动生成 `frpc.toml`、
  用 `frpc verify` 预检并守护 `frpc` 进程
- **cloudflared**——快速隧道免账号，一条命令拿到临时 HTTPS 域名
- **natapp**——粘贴在 natapp.cn 复制的隧道 authtoken
- **自定义**——任何命令，支持 `{{port}}` / `{{configFile}}` 占位符

手机打开展示的公网地址（或扫码），输入访问密码即可。

**2b. 或者自建中继服务端：**

```bash
cd packages/server
docker compose up -d --build
docker compose logs relay | grep "admin password"   # 管理台初始密码
```

浏览器打开 `https://<服务端>:8443/__relay/admin`，然后在插件设置里点「一键接入」，
回管理台批准即可。详细步骤见 [docs/deploy-nas.md](docs/deploy-nas.md)。

## 安全

- **三层门槛**：服务端按客户端隔离的密钥串、所有公网路径强制的 8 位访问密码
  （带限速锁定）、独立的管理台密码
- **密钥自动轮换**：中继密钥默认 30 天轮换，10 分钟宽限期；轮换通过已认证通道推送
- **不落盘**：中继服务端只做字节搬运，不保存任何业务数据
- **明文链路警示**：frp 纯端口映射——或任何 `http://` 入口——手机到公网入口一段是
  明文，访问密码经由该链路传输。建议选择 TLS 终结的入口（cloudflared、natapp，或
  给 frp 加一层 HTTPS 反代）；每种工具的取舍详见 [docs/tunnel.md](docs/tunnel.md)

## 文档

- [外接隧道指南](docs/tunnel.md)——支持的每种工具、要填什么、安全提示
- [中继服务端部署](docs/deploy-nas.md)——TLS 证书、DDNS、端口转发、nginx 反代
- [协议规格](docs/protocol.md)——隧道协议 v1.1（自建服务端模式）
- [部署验收清单](docs/acceptance-checklist.md)——部署后逐项自检
- 分包说明：[插件](packages/plugin) · [服务端](packages/server)

## 许可证

[MIT](LICENSE)
