# dsh-relay（DSH 插件）

[DSH Relay](https://github.com/xiaohanqing/dsh-relay) 的 DSH 端插件：局域网扫码直连 + 经你自己 NAS 的外网中继，断线自动重连。

```bash
dsh plugin --profile web add /path/to/dsh-relay/packages/plugin
```

重启 dsh web 后，设置页出现「DSH Relay」：局域网二维码开箱即用；外网访问需先在
NAS 部署 [dsh-relay-server](../server/)，然后在设置页填服务端地址与 Token。

开发：

```bash
npm install
npm run build:client   # client/settings.jsx → client/client.js
npm test               # 端到端回环测试
npm run test:worst     # 最坏启动路径（重连风暴护栏，CI 必跑）
```
