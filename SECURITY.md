# Security Policy / 安全策略

## 报告漏洞

**不要**用公开 Issue 报告安全漏洞。请使用 GitHub 的 [Private vulnerability reporting](https://github.com/xiaohanqing/dsh-relay/security/advisories/new)，或通过仓库主页联系方式私下报告。收到后 72 小时内回应。

## 设计上的安全边界

- 手机 → NAS：TLS（证书由部署者配置）+ 服务端 token 不参与手机链路；手机侧的门槛是电脑端 8 位访问密码
- 插件 → NAS：wss + `x-relay-token` 头鉴权，错误限速（5 次/分钟锁定）
- NAS 只做字节搬运，不落盘任何业务数据
- 访问密码 cookie 为 sha256(PIN:sessionKey) 派生值；DSH 进程重启后旧 cookie 失效

## 部署者须知

- RELAY_TOKEN 泄露 = 任何人可把自己的客户端接到你的 NAS（但还需要电脑端 PIN 才能进入 DSH），请立即更换并重启服务端
- 建议路由器只转发 443/80 两个端口
- 本项目不提供匿名性：NAS 域名即可定位你的家庭网络，介意者请自行权衡
