# dsh-relay 协议规格 v1

两端实现必须共同遵守的线缆协议。任何变更需同步更新本文档并升协议版本号。

## 总览

```
手机(任意网络)                          NAS（家宽公网 IPv4）                        电脑（DSH 所在机器）
     │                                       │                                            │
     │  https://dsh.example.com  (TLS)       │                                            │
     ├──────────────────────────────────────▶│  隧道（wss，插件主动拨出）                  │
     │   TLS 解密后的原始 HTTP 字节流          ├───────────────────────────────────────────▶│ dsh-relay 插件
     │                                       │   control + data 连接池                     │   └─▶ 127.0.0.1:<proxyPort>（本地代理）─▶ 127.0.0.1:<dshPort>（DSH web）
```

- 插件**永远主动外连** NAS：无需在电脑侧开任何入站端口，换网络无感。
- NAS 端只需一个 TLS 端口（默认 8443，建议路由器转发 443 → 8443）。
- 手机到 NAS 之间是标准 HTTPS；NAS 与插件之间是本协议。

## TLS 端口复用与分流

服务端在同一个 TLS 端口上承载两类流量，靠**首部嗅探**分流：

1. TLS 握手后缓冲首部 HTTP 请求头（直到 `\r\n\r\n`，上限 32KB / 10s 超时）；
2. 请求行路径以 `/__relay/` 开头 → **插件通道**（见下）；
3. 其它 → **手机流量**：该 TLS 连接上 TLS 解密后的原始字节流被整体当作
   一条 TCP 流，绑定给连接池里的一条空闲 data 连接透传（见「数据面」）。

约束：
- TLS ALPN 只提供 `http/1.1`（禁 h2，否则字节流是二进制帧，无法原样透传）。
- 嗅探使用 `socket.unshift()` 把字节还回去，两种路径都不丢首包。
- 手机流量不做任何 HTTP 解析——HTTP 语义（含 WebSocket upgrade、SSE、
  keep-alive）全部由电脑侧的本地代理解析，NAS 只做字节搬运。

## 插件通道（控制面 + 数据面）

插件向服务端建立两类 WebSocket（均为 `wss`，路径固定）：

| 路径 | 用途 | 帧格式 |
|---|---|---|
| `/__relay/ctl` | 控制连接（每插件 1 条） | JSON 文本帧 |
| `/__relay/data` | 数据连接池（每插件 N 条，默认 8） | 首帧 JSON 文本，其后全部二进制 |

### 握手与鉴权

- 每个 WS 连接的 HTTP upgrade 请求必须带头 `x-relay-token: <token>`。
- token 错误：升级前直接返回 `401` 并关闭；服务端对失败按来源 IP 限速
  （连续失败 ≥5 次/分钟 → 锁 60s）。
- token 由部署者在 NAS 上生成（建议 `openssl rand -hex 24`），填入插件设置页。
- `/__relay/status`：免鉴权的最小信息端点（`{"ok":true,"server":"dsh-relay-server/x.y.z"}`），
  供人用浏览器确认服务端活着；不泄露任何配置与统计。

### 控制面消息（JSON 文本帧）

方向 server → plugin：

```jsonc
{ "type": "hello", "server": "dsh-relay-server/1.0.0", "protocol": 1 }
{ "type": "pong",  "t": 1234567890 }                       // 回应 ping，携带原 t
{ "type": "stats", "phone": 2, "idle": 6, "uptime": 3600 } // 每 10s 推送
```

方向 plugin → server：

```jsonc
{ "type": "ping", "t": 1234567890 }   // 每 15s；20s 无 pong 判定链路死亡 → 重连
```

控制连接断开即视为整条链路故障（数据连接随后也会被服务端关闭）。

### 数据面

- 插件维持 N 条「空闲」data 连接（池）。连接建立后不发任何帧，等待被绑定。
- 手机 TCP 流到达 → 服务端取一条空闲 data 连接，先发**绑定帧**（JSON 文本）：
  `{ "bind": <connId> }`（connId 为服务端单调递增整数）。
- 绑定后该连接转为「已消耗」，双向语义：
  - server → plugin 二进制帧 = 手机发来的原始字节（TLS 解密后）；
  - plugin → server 二进制帧 = 发往手机的原始字节；
  - 任一侧 close/异常 → 两侧同时关闭（WS close 或 TCP destroy）。
- 插件收到绑定帧后，向 `127.0.0.1:<proxyPort>` 发起 TCP 连接并开始搬运；
  TCP 连不上（本地代理未起）→ 直接 close 该 data 连接（服务端会向手机回 502）。
- 池耗尽（手机流到达时无空闲连接）：服务端等待最多 5s（插件通常 <300ms 即补满），
  超时则向手机写 `HTTP/1.1 503 Service Unavailable` 并关闭。
- 插件侧补池：任一 data 连接 close（被消耗或断线）→ 立即新建一条补足 N 条；
  单条重建使用指数退避（1s 起，封顶 10s，±20% 抖动），成功后复位。

## 重连策略（插件侧）

| 对象 | 触发 | 策略 |
|---|---|---|
| 控制连接 | 断开/握手失败/ping 超时 | 指数退避 1s → 2s → 4s → … 封顶 30s（±20% 抖动）；成功后复位；已尝试次数与下次重试时间上报 UI |
| 数据连接 | 断开/close | 见上（池补充退避，封顶 10s） |
| 手动停止 | 用户关闭 | 全部连接关闭，状态 idle，退避计数复位 |

状态机（对设置页暴露）：`idle → connecting → ready ⇄ reconnecting →(手动) idle`；
连接后 `hello` 收到即进入 `ready`；控制连接断开进入 `reconnecting`（带 attempt 计数）。

## 本地代理（电脑侧，插件内）

 relay 隧道尽头是插件内置的反向代理（默认监听 `0.0.0.0:3082`，局域网手机直连与
 relay 隧道注入共用同一个端口）：

1. **信任栅栏改写**：把入站请求的 `Host` / `Origin` / `Referer` / `Sec-Fetch-Site`
   改写为 loopback 权威（`127.0.0.1:<dshPort>`）后转发 DSH web——DSH 的浏览器
   信任栅栏永远看到 loopback。WebSocket upgrade 同样处理并双向透传。
2. **浏览器会话握手**：新版 DSH web 要求 `GET /` 首次携带 `?token=<启动 token>`
   换会话 cookie。代理从 `ctx.connection.authenticatedUrl()` 实时取 token 注入；
   上游 303 后用 200 过渡页 + meta refresh 跳回（Safari 在 http://IP 源上不保存
   3xx 的 cookie）；按来源 IP 限 3 次/分钟，超限停止注入并给出提示页。
3. **访问密码（PIN）**：8 位字母/数字。来源分类 `loopback < lan < public`：
   - 经 NAS 域名（public）访问 → **强制**公网 PIN；
   - 局域网 IP 直连 → 按「局域网密码」开关（默认开）；
   - PIN 校验通过后种 HttpOnly cookie（值 = sha256(PIN:sessionKey)，30 天）；
     sessionKey 为插件进程级随机值，DSH 重启后手机需重新输入一次。
   - 登录接口 `POST /auth/login`；`?token=<明文 PIN>` 与 POST 等价（种 cookie 后去参数）。
   - 限速：单 IP 60s 内失败 ≥5 次 → 锁 60s；全局 50 次 → 锁 30s。
4. **polyfill 注入**：非安全上下文（局域网 http://IP）注入 `crypto.randomUUID`、
   `AbortSignal.any` 与 `__DSH_TRANSPORT__.createApiClient` 兜底（只缺失时补），
   仅注入未压缩的 `text/html` 文档并改写 Content-Length、禁缓存。
5. **WS 心跳**：对透传的浏览器侧 WS 每 30s 发协议层 Ping；连续 2 个周期无任何
   入站字节 → 判定静默断链，destroy 触发浏览器端自动重连（防 NAT/省电杀链路）。

## 安全模型

- 公网入口强制 TLS + token（NAS 端）+ PIN（代理端）双重门槛。
- token 只存两端各自本地（服务端 env/文件，插件 settings.json 0600），永不回显。
- cookie 值经 sha256(PIN:sessionKey) 派生，不可直接穷举；DSH 重启即失效。
- NAS 不落任何业务数据（纯字节搬运，无磁盘写）。
