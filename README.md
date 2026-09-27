# dsh-relay

**手机随时访问你自己的 DSH —— 流量走你自己的 NAS，不依赖任何第三方云。**

Phone access to your own DeepSeek Harness (DSH) from anywhere — relayed through **your own NAS**, with no third-party cloud involved.

[English](#english) · 中文

---

## 为什么

常见的手机访问方案（Cloudflare Tunnel / 各种第三方穿透云）有两个问题：

1. **不稳定**——免费隧道掉线、国内访问 Cloudflare 边缘质量差，掉线后往往不会自动恢复；
2. **不放心**——DSH 能在你的电脑上执行代码，让一家第三方云做中间人，链路不掌握在自己手里。

dsh-relay 的思路：**你家里已经有 NAS 和公网宽带，中间人应该是你自己。**

```
手机(任意网络) ──https──▶ NAS(dsh-relay-server) ◀──隧道(插件主动外连)── 电脑(dsh-relay 插件) ──▶ DSH
```

- 插件**永远主动外连** NAS：电脑侧不开任何入站端口，换 WiFi / 换网络无感
- 断线**秒级自动重连**（指数退避 + 心跳探活），重连策略完全自己可控
- 双重门槛：NAS 端 token 鉴权 + 电脑端 8 位访问密码
- NAS 只做字节搬运，不落任何业务数据

## 组成

| 包 | 说明 | 安装/部署 |
|---|---|---|
| [`packages/plugin`](packages/plugin) | DSH 插件 `dsh-relay`：本地反向代理 + 隧道客户端 + 设置页 | `dsh plugin --profile web add <本包路径>` |
| [`packages/server`](packages/server) | NAS 服务端 `dsh-relay-server`：单端口 TLS 中继 | Docker：见[部署文档](docs/deploy-nas.md) |

## 快速开始

### 1. NAS 上部署服务端（约 5 分钟）

前提：NAS 能跑 Docker；家宽有公网 IPv4；有一个解析到家里 IP 的域名（DDNS 即可）。

```bash
cd packages/server
openssl rand -hex 24 > /tmp/token
cp .env.example .env && vim .env          # RELAY_TOKEN=<上面生成的值>
mkdir certs && # 放入 fullchain.pem / privkey.pem（证书签发见 docs/deploy-nas.md）
docker compose up -d
```

路由器端口转发：外部 `443 → NAS:8443`。

> 以上是单客户端简易模式。**一个服务端可以同时带任意多台电脑**（每台一条独立
> token，手机按域名路由），见 `docs/deploy-nas.md` 第 5 节「多客户端」。

### 2. 电脑上装 DSH 插件

```bash
dsh plugin --profile web add /path/to/dsh-relay/packages/plugin
# 重启 dsh web 后，设置页会出现「DSH Relay」
```

### 3. 配对

DSH 设置页 → DSH Relay → 填服务端地址（`dsh.example.com`）和 Token → 开启 → 扫码。

局域网二维码开箱即用（无需 NAS），外网访问才需要中继。

## 文档

- [NAS 部署指南](docs/deploy-nas.md) —— 证书签发、DDNS、端口转发、排障
- [协议规格](docs/protocol.md) —— 两端通信协议（v1）
- [安全模型](docs/protocol.md#安全模型) —— 双重门槛、cookie 派生、限速

## License

[MIT](LICENSE)
