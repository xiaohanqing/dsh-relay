# 验收清单（最终联调）

插件重新启用 + NAS 部署完成后，逐项勾选。

## A. 插件启用复验（电脑侧）

- [ ] `cordis.patch.yml` 恢复 insert 行，重启 dsh-web
- [ ] 启动后观察 ≥5 分钟：`journalctl -u dsh-web.service` 无 OOM/fatal；CPU 稳定（`top` 单进程 <10%）
- [ ] 设置页出现「DSH Relay」，局域网二维码可见
- [ ] 局域网手机扫码 → 登录页 → 输 PIN → 进入 DSH，与电脑实时同屏
- [ ] **重启宿主再观察一轮**（自动恢复路径，上次事故的触发场景）

## B. NAS 服务端

- [ ] `curl -k https://127.0.0.1:8443/__relay/status` → `{"ok":true,...}`
- [ ] 路由器转发 443→8443；外网手机流量验证：`curl -k https://<域名>/__relay/status` 通
- [ ] 插件设置页填服务端地址 + Token → 开启 → 状态「已连接 NAS」
- [ ] NAS 端 `docker compose logs relay` 出现 `plugin control connected`

## C. 外网端到端

- [ ] 手机关 WiFi 走流量 → 打开 `https://<域名>` → 登录页 → PIN → DSH 正常使用
- [ ] WebSocket 实时性：电脑发消息，手机会话实时刷新
- [ ] 设置页显示「手机连接数 ≥1」（NAS 端 stats 回传）
- [ ] 断线自愈：NAS `docker compose restart relay` → 插件状态「重连中」→ 数秒内自动恢复「已连接」→ 手机刷新可用
- [ ] PIN 防线：未登录状态下直接访问 `/api` 返回 401

## D. 安全

- [ ] `RELAY_TOKEN` 未出现在任何聊天/截图/仓库文件里
- [ ] 路由器除 443（和签证书期的 80）外无其它公网端口映射
- [ ] 二维码/密码未转发给无关人员
