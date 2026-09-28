# dsh-relay（DSH 插件包）

[dsh-relay](https://github.com/xiaohanqing/dsh-relay) 的 DSH 端插件：局域网扫码直连、
外接隧道（frp / cloudflared / natapp / 自定义）或自建中继服务端，断线自动恢复。
功能总览与快速上手见[主 README](../../README.md)。

```bash
dsh plugin --profile web add 'github:xiaohanqing/dsh-relay#path:packages/plugin'
# 重启 dsh web，设置页出现「DSH Relay」
```

## 构建

插件包是**自包含构建**：安装方（`dsh plugin add`）不执行任何构建流程，
构建产物随仓库提交，构建脚本会校验产物与源码同步。

```bash
pnpm install                # 仓库根目录执行一次即可
pnpm build                  # 或进入本包：pnpm build
```

构建内容：

- `src/index.js` → `lib/index.js`（`build-host.mjs`：host 侧自包含 bundle，
  运行时依赖 ws/qrcode 内联）
- `client/settings.jsx` → `client/client.js`（esbuild：设置页 client bundle）

任一产物落后于源码，`pnpm build` 会以非零码失败并把新产物留在磁盘上——
检查 `git diff` 后一并提交。

## 测试

```bash
pnpm test               # 单元 + 端到端（代理 / 隧道 / 准入 / 注入口安全契约）
pnpm test:worst         # 最坏启动路径：重连风暴护栏（RSS / 重连速率）
pnpm test:worst:tunnel  # 隧道进程守护红线：spawn 速率 / RSS / 收割
```
