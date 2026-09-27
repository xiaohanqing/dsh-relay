# Contributing

感谢关注 dsh-relay！欢迎 Issue 与 PR。

## 开发环境

- Node.js ≥ 22
- pnpm（或 npm）

```bash
git clone https://github.com/xiaohanqing/dsh-relay.git
cd dsh-relay
npm install --workspaces          # 或分别进入两个包 npm install
npm run build:client -w packages/plugin
npm test -w packages/plugin
npm test -w packages/server
```

## 项目结构

```
packages/plugin   DSH 插件（src/ 服务端逻辑，client/ 设置页，client.js 为构建产物）
packages/server   NAS 服务端（src/server.mjs 单文件实现）
docs/protocol.md  两端通信协议——改动协议必须同步更新此文档
```

## 提交规范

- commit message 遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)（`feat:` / `fix:` / `docs:` / `refactor:` / `test:`）
- 新功能请附带测试；改协议请先开 Issue 讨论
- PR 前跑通两个包的测试与 `node --check` 全部源码

## 报告 Bug

开 Issue 时请附：两端版本、NAS 部署方式、插件状态页截图（**遮挡 token 与密码**）、服务端日志片段。
