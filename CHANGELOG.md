# Changelog

本项目的可读变更记录（语义化版本）。

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
