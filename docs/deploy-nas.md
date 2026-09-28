# NAS 部署指南

目标：在一台有公网 IPv4 的 NAS / Linux 机器上，把 `dsh-relay-server` 跑起来。

> 不想自建服务端？外接隧道模式复用已有的 frp 等内网穿透工具，零部署——
> 见 [tunnel.md](tunnel.md)。本指南只面向「要一台自己掌控的多客户端中继」的场景。

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

compose 里删掉 `RELAY_TLS_CERT` / `RELAY_TLS_KEY` 两个环境变量即可——服务端检测不到证书会自动退化为无 TLS 模式（协议行为不变，仅少加密层）。**仅限本机调试，勿暴露公网。**

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

### 替代方案：已有 nginx 反向代理（无需在服务端上配证书）

如果家里已有 OpenResty/1Panel 之类的反代（或者把服务端放在 VPS 上），可以直接用
「公网域名(HTTPS) → 反代 → http://内网:8443」的方式，TLS 由反代终止：

```nginx
# 关键点：必须支持 WebSocket 升级（DSH 界面与插件隧道全是 WS）
location / {
    proxy_pass http://192.168.31.70:8443;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 3600s;      # 长连接别被默认 60s 掐断
    proxy_send_timeout 3600s;
    client_max_body_size 16m;      # DSH 单请求上限 8MB，留余量
    proxy_buffering off;           # 流式透传
}

# 建议把管理台限制在内网，不暴露公网
location ^~ /__relay/admin {
    allow 192.168.31.0/24;         # 改成你的实际网段
    deny all;
    proxy_pass http://192.168.31.70:8443;
    proxy_set_header Host $host;
}
```

注意：站点要**关掉 HTTP/2**（nginx 的 h2 不支持 WebSocket 升级）。此方式下插件填
反代域名即可（如 `relay.example.com`，nginx 上的 https/wss 自动生效）。

## 4. 电脑端配置

DSH 设置页 → DSH Relay：

- **推荐「一键接入」**：填服务端地址 → 点「申请接入」→ 到管理台批准即可，
  密钥串自动下发
- 高级：手动填服务端地址 + 密钥串（管理台「添加客户端」生成）
- 开启 → 状态显示「已连接服务端」后扫码即可

## 5. 多客户端（可选）：一个服务端带多台电脑

一个服务端可以同时服务任意多台 DSH（协议 v1.1 多租户）。**推荐直接用网页管理台**：

浏览器打开 `http://<NAS地址>:8443/__relay/admin`（首次密码看
`docker compose logs relay | grep "admin password"`，之后存在 `data/admin-password`）。
页面上可以看每个客户端的在线状态、添加客户端（自动生成 token，只在生成时显示一次）、
删除客户端——全程不用 SSH。

CLI 等价方式：

```bash
cd packages/server
# 加一个客户端（token 会打印出来，填到对应电脑的插件设置页）：
docker compose run --rm relay node src/server.mjs add-client /data/clients.json home dsh.example.com
```

规则：

- 每个客户端配一个 `domain`，各域名都解析到家里 IP；手机访问哪个域名就进哪台电脑
- 保留一条**不带 domain** 的客户端作为默认（裸 IP 访问落到它）；
  全部都带 domain 时，未匹配域名返回 421
- 客户端之间完全隔离：token 不同、连接池不同，拿到 A 的 token 碰不到 B
- 查看现状：`docker compose run --rm relay node src/server.mjs list-clients /data/clients.json`

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
