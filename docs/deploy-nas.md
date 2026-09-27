# NAS 部署指南

目标：在一台有公网 IPv4 的 NAS / Linux 机器上，把 `dsh-relay-server` 跑起来。

## 0. 前提检查

- NAS 能跑 Docker（群晖 Container Manager / 威联通 Container Station / 任意 Linux + docker compose）
- 家宽有**公网 IPv4**：百度搜「IP」看到的地址 == 路由器 WAN 口地址。没有的话，本方案不适用（可考虑 frp + VPS）
- 一个域名解析到家里 IP。IP 会变就上 DDNS（ddns-go、群晖自带 DDNS 等均可）

## 1. 签发 TLS 证书

手机到 NAS 必须是 HTTPS。三选一：

### 方式 A：certbot（推荐，全自动）

```bash
cd packages/server
mkdir certs
# 首次签发（需要 80 端口可用）：
docker run --rm -p 80:80 -v "$PWD/certs:/etc/letsencrypt" certbot/certbot \
  certonly --standalone -d dsh.example.com --email you@example.com --agree-tos --no-eff-email
cp certs/live/dsh.example.com/fullchain.pem certs/
cp certs/live/dsh.example.com/privkey.pem certs/
```

续期（crontab）：

```
0 4 * * 1 cd /path/to/packages/server && docker run --rm -p 80:80 -v "$PWD/certs:/etc/letsencrypt" certbot/certbot renew && docker compose restart relay
```

### 方式 B：已有通配符证书

把 `fullchain.pem` / `privkey.pem` 放进 `packages/server/certs/` 即可。

### 方式 C：仅测试（不安全）

compose 里去掉两个 TLS 环境变量并加 `RELAY_INSECURE=1`。**仅限本机调试，勿暴露公网。**

## 2. 配置与启动

```bash
cd packages/server
openssl rand -hex 24                    # 复制输出
cp .env.example .env                    # 编辑 .env：RELAY_TOKEN=<复制的值>
docker compose up -d
docker compose logs -f relay            # 看到 "listening on" 即成功
```

自检（本机）：`curl -k https://127.0.0.1:8443/__relay/status` → `{"ok":true,...}`

## 3. 路由器端口转发

| 外部端口 | 内部目标 | 用途 |
|---|---|---|
| 443 | NAS:8443 (TCP) | 手机访问 + 插件隧道（同一端口，自动分流） |
| 80 | NAS:80 (TCP) | 仅 certbot 签发/续期时需要（方式 A） |

## 4. 电脑端配置

DSH 设置页 → DSH Relay：

- 服务端地址：`dsh.example.com`（如果没做 443 转发而是直映射，写 `dsh.example.com:8443`）
- Token：步骤 2 生成的值
- 开启 → 状态显示「已连接 NAS」后扫码即可

## 排障

| 症状 | 检查 |
|---|---|
| 插件一直「重连中」 | `curl -k https://域名/__relay/status` 通不通；token 是否一致；路由器 443→8443 是否 TCP 转发 |
| 浏览器打开域名 503 | 服务端起来了但插件未连接（池为空）——检查插件设置页状态 |
| 打开是登录页但密码总是错 | 电脑端设置页的「访问密码」会随 DSH 重启轮换（自定义则固定），回设置页看当前值 |
| 手机流量走不了、设置页正常 | 检查 NAS 时间是否准确（TLS 对时间敏感）；ALPN 是否被中间设备改写（本服务端强制 http/1.1） |
| 家里 IP 变了 | 上 DDNS；域名解析生效后无需改插件（插件始终主动外连） |

## 安全清单

- [ ] RELAY_TOKEN 足够长且未提交进任何仓库
- [ ] 路由器**只**转发了 443（和签证书用的 80），不要把 NAS 管理界面暴露公网
- [ ] 访问密码未分享（二维码 = 钥匙）
- [ ] 定期 `docker compose pull && up -d` 更新镜像
