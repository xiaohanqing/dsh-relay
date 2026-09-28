# Changelog

本项目的可读变更记录（语义化版本）。

## [0.4.0] - 2026-09-28

### 新增
- **外接隧道模式**：免自建服务端，复用已有的 frp 等内网穿透工具
  - 稳定回环注入口（默认 `127.0.0.1:3083`，仅回环监听、被占自动 +1 且实际端口
    持久化；其上流量与 relay 隧道入口同语义——一律按公网强制访问密码 + 限速，
    不信任 Host 头声明）
  - 深度适配 **frp**：表单生成 `frpc.toml`（tcp 端口映射 / http / https 域名复用，
    `transport.tls.enable` 默认开，`loginFailExit = false`），`frpc verify` 启动
    预检（旧版无此子命令时跳过并提示），自动注入回环 admin 端口便于排障；支持
    直接粘贴完整 frpc.toml 的高级模式
  - 深度适配 **cloudflared**：快速隧道免账号拿临时 HTTPS 域名；named tunnel 支持
    填 token 固定域名
  - 深度适配 **natapp**：粘贴 authtoken 即用（国内节点，免费隧道 1Mbps/随机域名）
  - **自定义模板**（万能兜底）：任意工具的启动命令 + 可选配置文件模板，
    支持 `{{port}}` / `{{configFile}}` 占位符，命令按 shell 词法切分防注入——
    bore、rathole、nps 等均可接入
  - **TunnelManager 进程守护**（对齐重连红线）：exit/error once 守卫、manager 级
    退避（60s 硬封顶、稳定运行 60s 才复位）、单进程 spawn 状态机、
    SIGTERM→SIGKILL 进程组收割、日志环形缓冲 50 行；配置类错误不自动重试
- **接入方式三态**：`mode = relay | tunnel | lan`（自建服务端 / 外接隧道 / 仅局域网），
  设置页重构为三选一；0.3.x 配置无 `mode` 字段时按 `relayEnabled` 推导，升级行为
  完全不变
- **pnpm monorepo 重组**：根 `package.json` + `pnpm-workspace.yaml` + `scripts/`
  （check / build / release），CI 全面切换 pnpm；插件包改为**自包含构建**——
  `src/index.js` 经 `build-host.mjs` 打包为 `lib/index.js`（运行时依赖一并内联），
  产物随仓库提交，`dsh plugin add` 本地安装不再依赖包目录内的 node_modules，
  构建脚本对产物与源码不同步直接失败

### 测试
- **worst-case 隧道红线回归**（`test:worst:tunnel`）：隧道目标"起不来→恢复→再亡"
  全程监控 RSS 与 spawn 速率（≤1 次/秒）
- 适配器单测 20+（配置生成 / URL 推导 / 命令切分 / URL 提取 / 二进制定位）、
  TunnelManager 生命周期 10 例、注入口安全契约 e2e（伪造 loopback Host 不免密、
  密码通过后种 cookie、限速锁定）

### 修复
- `logWarn` 双打：`log.warn` 返回 undefined 时误触 console 兜底，同一告警打两遍
- worst-case 速率指标窗口化：排除启动初期连接池建立的预期 burst，指标只度量
  真正的风暴区间

## [0.1.0] - 2026-09-27

首个公开版本。

### 新增
- **packages/plugin**（npm `dsh-relay`）：DSH 插件——本地反向代理（Host/Origin 改写、
  WebSocket 透传、WS 心跳保活）、relay 隧道客户端（连接池 + 指数退避重连 + ping/pong
  探活）、设置页（局域网/NAS 中继二维码、访问密码管理）
- **packages/server**（npm `dsh-relay-server`）：NAS 端单端口 TLS 中继——嗅探分流
  手机流量与插件通道、数据连接池、token 鉴权、失败限速
- 安全：隧道入口（inlet）强制公网 PIN，防 relay token 泄露 + Host 伪造提权；
  8 位访问密码（公网强制/局域网开关）、登录限速、cookie 经 sha256(PIN:sessionKey) 派生
- 测试：协议端到端回环（HTTP/WS/PIN/重连/并发过池）+ 最坏启动路径回归
  （目标不可达→拉起→再杀，RSS/重连速率护栏）
- 文档：协议规格（docs/protocol.md）、NAS 部署指南（docs/deploy-nas.md）

### 修复（0.1.0 内迭代）
- 重连风暴：error/close 双触发无守卫导致指数级重连 → 宿主 OOM（once 守卫 +
  池级退避 + in-flight 封顶）

## [0.2.0] - 2026-09-27

### 新增
- **多租户**：单服务端支持任意多客户端（`clients.json` 注册表），插件按 token 归属、
  各客户端独立控制连接与数据池；手机流量按 Host/域名路由，未匹配落默认客户端，
  无默认则 421；向后兼容单 `RELAY_TOKEN` 部署
- **网页管理台**（`/__relay/admin`）：登录鉴权（独立管理密码，自动生成落盘）、
  会话 cookie、登录限速（5 次锁 5 分钟）；客户端增删即时生效并原子回写
- CLI：`add-client` / `list-clients`
- 空注册表引导启动（准入模式铺垫）

### 修复
- 短响应路径（status/503/421）未兜 socket error，客户端 RST 触发未处理
  ECONNRESET 打崩服务端进程（实测崩溃；回归测试：读响应后 RST 探针）

## [0.3.0] - 2026-09-27

### 新增
- **准入审批**：`POST /__relay/enroll(/poll)`——客户端凭服务端地址申请接入并上报
  身份档案（主机名/OS/MAC/IP/版本），管理台批准后自动生成专属密钥并下发，
  插件零复制粘贴完成接入；严格限速（10 次/分/IP、队列上限 8、10 分钟过期），
  可选邀请码
- **密钥轮换**：手动 + 自动（默认 30 天），通过已认证通道无感推送新密钥；
  旧密钥 10 分钟宽限，宽限期内重连的客户端立即补收新密钥（闭环自愈）
- **管理台 v2**：仪表盘、待审批面板、客户端身份卡片（在线状态/来源 IP/密钥龄期/
  改域名/轮换/删除）、设置区（管理密码/邀请码/轮换周期/池参数）、事件日志
- 插件「一键接入」表单（保留手填密钥串的高级入口）；连接成功上报身份档案
- `settings.json` 管理台可改配置持久化

### 修复
- 插件数据池 in-flight 名额泄漏：open 前失败的连接不归还计数，失败攒够 8 次后
  数据池永久瘫痪（实测踩中；回归测试：死端口撞满后服务端上线必须恢复）
- 数据池重连调度加确定性轮转散布（+0/0.7/1.4/2.1/2.8s），消除退避封顶聚簇
  （重连峰值 5 次/秒 → 稳定 ≤3）
