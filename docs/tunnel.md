# 外接隧道模式指南

不想自建中继服务端？外接隧道模式复用你已经在用的内网穿透工具：插件在本机生成配置、
启动并守护隧道客户端，把 DSH 暴露到该隧道的公网入口。手机访问入口地址，入口流量被
转回本机的**稳定注入口**，再经本地代理进入 DSH。

```
手机 ──HTTPS──▶ 隧道公网入口（frps / Cloudflare / natapp / …）
                        │   隧道（你的电脑主动外连建立）
                        ▼
              127.0.0.1:3083  ← 稳定注入口（仅回环监听，强制访问密码）
                        ▼
              dsh-relay 本地代理 :3082 ──▶ DSH web（127.0.0.1:3080）
```

两个安全设计先说清楚：

- **注入口只监听回环**（默认 `127.0.0.1:3083`，被占时自动 +1 并把实际端口持久化，
  设置页可见）。能到达这个端口的流量只有本机进程——也就是你授权的隧道客户端。
- **注入口上的流量一律按公网标准强制 8 位访问密码**，不信任任何 Host 头声明，
  带限速锁定。无论隧道入口在哪、谁来转发，这道门都不会少。

## 工具总览

| 工具 | 需要准备什么 | 手机访问形态 | TLS |
|---|---|---|---|
| **frp** | 已有的 frps：地址 / 端口 / token（+远程端口） | `http://frps地址:远程端口` 或域名 | 取决于形态，见下文 |
| **cloudflared** | 什么都不用（快速隧道免账号） | `https://xxx.trycloudflare.com`（临时） | ✅ 全程 |
| **natapp** | natapp.cn 注册 + 隧道 authtoken | `http://xxx.natappfree.cc`（免费版随机域名） | ✅ 隧道自身加密 |
| **自定义模板** | 任何隧道工具的启动命令 | 取决于工具 | 取决于工具 |
| **自己管理** | 你自己的隧道客户端配置 | 取决于工具 | 取决于工具 |

---

## frp

最常见场景：**朋友已经有一台 frps**，你只需要四个信息——

1. `serverAddr`：frps 地址（IP 或域名）
2. `serverPort`：frps 端口（默认 7000）
3. `token`：frps 鉴权 token（问朋友要）
4. 远程端口：映射后在 frps 上暴露的端口

在设置页选「外接隧道 → frp」，填入这四项，点启动。插件会：

- 生成 `frpc.toml`（`localPort` 自动指向本机注入口，`loginFailExit = false`，
  日志落盘保留 3 天）
- 执行 `frpc verify` 预检配置（frpc 版本过老没有 verify 子命令时跳过并提示）
- 启动 `frpc` 并守护：进程异常退出按有界退避重启（配置类错误——预检失败、
  二进制缺失、必填项缺失——直接报错，**不**盲目重试）
- 自动分配一个回环 admin 端口写入配置，排障时可 `curl 127.0.0.1:<admin端口>/api/status`
  查看转发状态

### frps 侧需要满足什么

- 鉴权 token 一致（`auth.token`）
- 远程端口落在 frps 的 `allowPorts` 白名单内（如果配置了）
- frp 建议 **v0.50.0+**：插件生成的配置默认 `transport.tls.enable = true`
  （frpc↔frps 段加密）；朋友的 frps 更老时，在表单里关闭该选项

### 三种暴露形态

| 形态 | 额外要填 | frps 侧要求 | 手机访问 | 安全提示 |
|---|---|---|---|---|
| **tcp 端口映射**（最通用） | 远程端口 | 无 | `http://<frps地址>:<远程端口>` | ⚠️ 手机↔frps 段**明文**，访问密码经由该链路 |
| **http 域名复用** | 自定义域名或子域名 | `vhostHTTPPort`（+`subDomainHost`，用子域名时） | `http://<域名>` | ⚠️ 同上，明文 |
| **https 域名复用** | 自定义域名 + 证书与 TLS 终结配置 | `vhostHTTPSPort`，TLS 需在某一侧终结 | `https://<域名>` | 取决于 TLS 终结配置，见下 |

https 形态属于进阶用法：frp 的 https 代理把 TLS 流量按域名路由，**证书与 TLS 终结
需要额外配置**（frps 侧反代，或 frpc 的 `https2http` 插件——表单暂未覆盖插件字段）。
不确定怎么配时，优先用 tcp 形态，并在 frps 前面加一层 HTTPS 反向代理（nginx / caddy）。

明文形态下建议：给 frps 配上 TLS（https 形态），或至少确保访问密码足够强、
不与其他密码复用。frp 的 `transport.tls` / `useEncryption` 只加密 frpc↔frps 段，
**不覆盖** 手机↔frps 段。

### 高级：raw frpc.toml

已有完整 `frpc.toml` 的用户可以直接粘贴，插件原样落盘（仅自动补一个 admin 端口，
不覆盖你已有的 `webServer.port`）。此模式下：

- 配置里必须包含 `serverAddr`
- **`localPort` 由你自己指向注入口**（默认 3083，见设置页显示的实际端口）
- 公网地址无法自动推导，以 frpc 日志/状态为准

### 二进制从哪来

[gofrp.org 官方下载](https://gofrp.org/zh-cn/docs/download/)（国内源）或
[GitHub Releases](https://github.com/fatedier/frp/releases)。把 `frpc` 放进 PATH，
或在设置页填完整路径。frp 为 Apache-2.0 许可，本项目不捆绑分发。

---

## cloudflared

**快速隧道（quick tunnel）**：不需要 Cloudflare 账号，零配置。设置页选
「外接隧道 → cloudflared」，确保 `cloudflared` 二进制可用（PATH 或填完整路径，
[官方下载](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)），
点启动即可拿到 `https://<随机子域>.trycloudflare.com` 临时域名——**进程退出即失效**，
适合临时用、不适合长期驻留。

**固定域名**：需要 Cloudflare 账号创建 named tunnel，把 tunnel token 填进表单，
域名即固定。

- ✅ 边缘 TLS，全程加密
- ⚠️ 中间人是 Cloudflare（第三方）；国内连通性不稳定，部分地区无法访问——国内环境
  建议用 frp 或 natapp

---

## natapp

国内穿透服务（[natapp.cn](https://natapp.cn)）：注册后在后台复制隧道 authtoken，
设置页选「外接隧道 → natapp」粘贴即可。

- 免费隧道：**1Mbps 带宽、随机域名**（形如 `http://xxx.natappfree.cc`），域名不定期
  强制更换；付费隧道带宽更高、域名固定
- ✅ 隧道自身加密，国内节点速度快
- ⚠️ 中间人是 natapp（第三方商业服务）；流量经由其服务器

---

## 自定义模板（万能兜底）

任何没有深度适配的隧道工具都能接。填两项：

- **启动命令**：支持 `{{port}}`（注入口端口号）与 `{{configFile}}`（由配置模板渲染出
  的文件路径）占位符；命令按 shell 词法规则切分，防注入
- **配置文件模板**（可选）：内容里的 `{{port}}` 会被替换为实际注入口端口，渲染结果
  落盘后路径即为 `{{configFile}}`

### 例 1：bore

启动命令：

```
bore local {{port}} --to bore.pub
```

公网地址为 `bore.pub:<随机端口>`（bore 启动输出里可见，插件状态页可看日志）。
⚠️ bore 默认**不加密**流量，手机↔bore.pub 段明文，仅建议临时使用。

### 例 2：rathole

配置文件模板（`remote_addr`、`token`、`local_addr` 换成你自己的）：

```toml
[client]
remote_addr = "your-server:2333"

[client.services.dsh]
token = "your-token"

[client.services.dsh.local]
type = "tcp"
local_addr = "127.0.0.1"
local_port = {{port}}
```

启动命令：

```
rathole {{configFile}}
```

公网地址为 `your-server:<远端端口>`（rathole 服务端配置决定）。

---

## 自己管理隧道

如果你已经是隧道工具的老手，可以完全不用上面的托管流程：

1. 设置页把接入方式切到「外接隧道」（或直接不动托管配置）
2. 用你自己的方式把**任何**公网入口转发到 `127.0.0.1:3083`（默认端口；实际端口以
   设置页显示为准），例如：

   ```bash
   # frp：在你已有的 frpc.toml 里加一段
   [[proxies]]
   name = "dsh"
   type = "tcp"
   localIP = "127.0.0.1"
   localPort = 3083
   remotePort = 63082

   # ssh 远程转发
   ssh -R 63082:127.0.0.1:3083 user@your-server
   ```

3. 手机访问该入口，输入访问密码

到达注入口的流量无论来自哪个工具，都同样经过强制访问密码与限速——注入口的
安全语义与托管模式完全一致。

---

## 安全提示汇总

| 路径 | 明文段 | 建议 |
|---|---|---|
| frp tcp / http 形态、bore、任何 `http://` 入口 | 手机↔公网入口（访问密码途经） | 换 https 形态或加密隧道；至少用强密码 |
| cloudflared、natapp | 无（入口 TLS） | — |
| frp https 形态 | 取决于 TLS 终结配置（证书/插件） | 配好证书与终结层后全程 TLS |
| frpc↔frps 段 | 无（`transport.tls.enable` 默认开） | frps < v0.50 时注意显式开启或换形式 |

一句话原则：**中间人是谁，取决于隧道入口由谁运营。** frps 是你/朋友的机器 = 中间人
是你可信的人；cloudflared / natapp = 中间人是服务商。本项目自建中继模式的立意
「中间人应该是你自己」在外接隧道模式下同样成立——选谁做中间人，是你自己的决定。
