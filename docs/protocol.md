# dsh-relay 协议 v1.1

一个 TLS 端口承载全部流量。服务端只做鉴权 + 嗅探分流 + 字节搬运，不理解业务。

## 总览

```
手机浏览器 ──HTTPS──┐
                    ├──> NAS:8443 (dsh-relay-server)
插件(DSH) ──wss─────┘        │ 嗅探分流
                             ├─ /__relay/ctl   插件控制 WS
                             ├─ /__relay/data  插件数据 WS 池
                             ├─ /__relay/status 健康检查（免鉴权）
                             └─ 其余路径        手机流量 → 透传给插件
```

插件始终**主动外连**服务端（家里不开任何入站端口）；手机连接服务端，由服务端把字节流
原样搬给插件，插件内的反向代理再把请求打到本机 DSH。

## 多租户（v1.1）

服务端持有客户端注册表（`RELAY_CLIENTS_FILE` 指向 JSON 文件，或 env 直接注入）：

```json
[
  { "id": "home",   "token": "<48hex>", "domain": "dsh.example.com" },
  { "id": "office", "token": "<48hex>", "domain": "office.example.com" },
  { "id": "default" }
]
```

- **插件归属**：插件连接 `/__relay/ctl`、`/__relay/data` 时带 `x-relay-token` 头，
  服务端按 token 找到唯一对应客户端。每个客户端拥有独立的控制连接与数据池，互不可见。
- **手机路由**：手机请求按 `Host` 头（小写、去端口）精确匹配客户端 `domain`；
  未匹配时落到**没有 domain 的默认客户端**（裸 IP 访问兼容）；注册表全带 domain 且
  Host 不匹配时返回 `421 Misdirected Request`。
- 同一 token 不允许重复，domain 亦然；id 仅用于日志与 `/__relay/status` 展示。
- 向后兼容：只配 `RELAY_TOKEN` 的部署等价于单客户端注册表 `[{id:"default", token}]`。

## 插件通道

### 控制连接 `GET /__relay/ctl`（WebSocket）

请求头：`x-relay-token: <客户端 token>`。

- 服务端→插件首帧：`{"type":"hello","server":"dsh-relay-server/x","protocol":1,"client":"<id>","pool":8}`
- 心跳：插件每 15s 发 `{"type":"ping","t":<ms>}`，服务端回 `{"type":"pong","t":...}`；
  20s 无 pong 判定断线重连。
- 服务端每 10s 推 `{"type":"stats",...}`（本客户端视角）。
- 新的控制连接会替换旧连接（旧连接被 `4000 replaced` 关闭）；控制连接断开时，
  该客户端所有手机流与数据池一并关闭。
- 插件连接成功后发 `{"type":"info","info":{hostname,os,macs,ips,version}}` 上报身份档案。
- 服务端轮换密钥时推 `{"type":"rotate","token":"<新密钥>"}`；插件持久化新密钥并重建全部
  连接。旧密钥有 10 分钟宽限期（期间仍可认证；用旧密钥重连的客户端会立刻再收到一次
  新密钥推送，形成闭环）。

### 数据连接 `GET /__relay/data`（WebSocket 池）

同样带 `x-relay-token`。插件维持一个空闲连接池（默认 8 条，`hello.pool` 提示）：

1. 服务端有手机流要转发时，取一条空闲连接，发送文本帧 `{"bind":<connId>}`；
2. 之后该连接上：
   - 服务端→插件：手机发来的**原始字节**（binary 帧，首帧为嗅探缓存的请求头）；
   - 插件→服务端：回给手机的**原始字节**（必须是 binary 帧；text 帧一律丢弃，防注入）；
3. 插件收到 `bind` 后立即连回本机 DSH 端口并双向搬运；同时向池补充新连接；
4. 任一侧断开即整条拆除，`connId` 不复用。

## 手机流量

除 `/__relay/*` 外的所有路径都是手机流量。服务端嗅探每条连接的首包（≤32KB、≤10s）：

- 是 HTTP 且路径为 `/__relay/status` → 免鉴权回 `{"ok":true,...}`（健康检查/探活）；
- 是 HTTP 且路径以 `/__relay/` 开头 → 插件通道（按上面鉴权）；
- 其余（含超限/超时/非 HTTP）→ 当作手机流，按 Host 路由后整条透传。

透传是纯字节搬运：不解析 Cookie、不改写内容、不知道 TLS 之外还有没有加密。

## 鉴权与限速

- 插件侧：仅 `x-relay-token`，常量时间比较。
- 失败限速：单来源 IP 60 秒内失败 ≥5 次 → 锁定 60s（429 + Retry-After）。
- 手机侧鉴权由**插件内**的访问密码（PIN）承担，服务端不参与——服务端只认 token 和字节。

## 准入审批（enrollment）

客户端无需预置密钥即可申请接入：

1. 插件 `POST /__relay/enroll`：`{code?, info:{hostname,os,macs,ips,version}}`（无鉴权，
   严格限速：单 IP 10 次/分钟；待审批队列上限 8；申请 10 分钟过期）。
2. 管理台（`/__relay/admin`）显示待审批卡片，管理员批准 → 生成专属密钥串并入档身份。
3. 插件 `POST /__relay/enroll/poll {requestId}`（3s 轮询，10 分钟上限）→
   `approved`（返回 clientId + token）/ `denied` / `expired`。
4. 插件持久化密钥后立即用正常通道建立隧道。待审批队列只存内存，重启即清，
   客户端 poll 到 expired 会重新申请——不产生孤儿状态。
5. 可选邀请码：管理台设置后申请必须携带（默认关闭，开放申请 + 管理员批准）。

## 安全设计

1. 服务端管理面（WebUI）独立鉴权，与插件 token、手机 PIN 互不相干；转发面
   不落盘任何用户数据；攻击面 = token 校验 + 字节搬运 + 严格限速的管理台。
2. 仅 ALPN `http/1.1`（禁 h2：明文字节流必须可透传）。
3. 建议全程 TLS（`RELAY_TLS_CERT` / `RELAY_TLS_KEY`）；无证书时服务端拒绝启动，
   除非显式清空证书路径退化为调试模式（协议不变，仅无加密）。
4. 多租户隔离以 token 为界：拿到 A 的 token 无法触碰 B 的任何连接与流量。
