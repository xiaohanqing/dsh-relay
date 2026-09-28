# dsh-relay-server

[dsh-relay](https://github.com/xiaohanqing/dsh-relay) 的自建中继服务端：单端口 TLS 中继，
把家里电脑上的 DSH 安全地暴露给手机，中间人是你自己。功能对比与两种接入方式见
[主 README](../../README.md)；不需要多机管理、只想复用已有 frp 等隧道的话，
无需部署本服务端，见[外接隧道指南](../../docs/tunnel.md)。

```bash
openssl rand -hex 24          # 生成 token
cp .env.example .env          # 填入 RELAY_TOKEN
mkdir certs                   # 放入 fullchain.pem / privkey.pem（签发见 docs/deploy-nas.md）
docker compose up -d
curl -k https://127.0.0.1:8443/__relay/status   # {"ok":true,...} 即成功
```

环境变量：`RELAY_TOKEN`（或 `RELAY_TOKEN_FILE`，Docker secrets；多客户端用
`RELAY_CLIENTS_FILE` 注册表）、`RELAY_PORT`（默认 8443）、
`RELAY_TLS_CERT` / `RELAY_TLS_KEY`（缺省则退化为无 TLS——仅限本机调试）。

详细部署（TLS 证书 / DDNS / 端口转发 / nginx 反代）见仓库
[docs/deploy-nas.md](../../docs/deploy-nas.md)，协议见 [docs/protocol.md](../../docs/protocol.md)。
