# dsh-relay-server

[dsh-relay](https://github.com/xiaohanqing/dsh-relay) 的 NAS 服务端：单端口 TLS 中继，把家里电脑上的 DSH 安全地暴露给手机，不依赖任何第三方云。

```bash
openssl rand -hex 24          # 生成 token
cp .env.example .env          # 填入 RELAY_TOKEN
mkdir certs                   # 放入 fullchain.pem / privkey.pem（签发见 docs/deploy-nas.md）
docker compose up -d
curl -k https://127.0.0.1:8443/__relay/status   # {"ok":true,...} 即成功
```

环境变量：`RELAY_TOKEN`（或 `RELAY_TOKEN_FILE`，Docker secrets）、`RELAY_PORT`（默认 8443）、
`RELAY_TLS_CERT` / `RELAY_TLS_KEY`（缺省则退化为无 TLS——仅限本机调试）。

协议见仓库 `docs/protocol.md`。
