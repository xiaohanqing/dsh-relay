// frp 适配器（fatedier/frp，Apache-2.0）——深度适配：表单生成 frpc.toml + verify 预检。
//
// 两种形态：
//   form：插件生成完整 frpc.toml（tcp 端口映射 / http / https 域名复用），
//         localPort 固定指向本机稳定隧道注入口，transport.tls.enable 默认开
//         （frps 侧需 v0.50+；更老版本显式关 transport.tls）。
//   raw ：用户已有 frpc.toml，原样落盘（管理员级用法；localPort 由用户自己指向注入端口）。
//
// loginFailExit=false + 插件侧退避守护：frps 暂时不可达时 frpc 自身无限重试，
// 进程崩溃/被杀由 TunnelManager 按红线重启。
// webServer（admin）端口写入配置便于人工排障（curl 127.0.0.1:<admin>/api/status）。

import { join } from 'node:path';
import { resolveBin } from './resolve-bin.mjs';

const TOOL = 'frpc';

function tomlStr(v) { return JSON.stringify(String(v ?? '')); }

/** 生成 frpc.toml 内容。纯函数，单测覆盖。 */
export function buildFrpcToml({ config, localPort, adminPort, logFile }) {
  const c = config ?? {};
  const raw = String(c.rawToml ?? '').trim();
  if (raw) {
    if (!/serverAddr\s*=/.test(raw)) throw new Error('frpc.toml 缺少 serverAddr | raw frpc.toml has no serverAddr');
    // 注入 admin 口便于排障（用户已写则不覆盖）
    let t = raw;
    if (!/webServer\.port\s*=/.test(t)) {
      t += `\nwebServer.addr = "127.0.0.1"\nwebServer.port = ${adminPort}\n`;
    }
    return t.endsWith('\n') ? t : `${t}\n`;
  }
  const serverAddr = String(c.serverAddr ?? '').trim();
  if (!serverAddr) throw new Error('请填写 frps 服务器地址 | frps server address required');
  const token = String(c.token ?? '').trim();
  if (!token) throw new Error('请填写 frps 鉴权 token | frps auth token required');
  const type = ['tcp', 'http', 'https'].includes(c.proxyType) ? c.proxyType : 'tcp';
  if (type !== 'tcp' && !String(c.customDomain ?? '').trim() && !String(c.subdomain ?? '').trim()) {
    throw new Error('http/https 形态需要填写自定义域名或子域名 | custom domain or subdomain required');
  }

  const lines = [
    `serverAddr = ${tomlStr(serverAddr)}`,
    `serverPort = ${Number(c.serverPort) > 0 ? Number(c.serverPort) : 7000}`,
    `auth.token = ${tomlStr(token)}`,
    `loginFailExit = false`,
    `transport.tls.enable = ${c.tlsDisable === true ? 'false' : 'true'}`,
    `webServer.addr = "127.0.0.1"`,
    `webServer.port = ${adminPort}`,
    `log.to = ${tomlStr(logFile)}`,
    `log.level = "info"`,
    `log.maxDays = 3`,
    ``,
    `[[proxies]]`,
    `name = "dsh-relay"`,
    `type = "${type}"`,
    `localIP = "127.0.0.1"`,
    `localPort = ${localPort}`,
  ];
  if (type === 'tcp') {
    lines.push(`remotePort = ${Number(c.remotePort) > 0 ? Number(c.remotePort) : 0}`); // 0 = frps 随机分配
    if (c.useEncryption !== false) lines.push(`transport.useEncryption = true`);
  } else {
    const domain = String(c.customDomain ?? '').trim();
    const sub = String(c.subdomain ?? '').trim();
    if (domain) lines.push(`customDomains = [${tomlStr(domain)}]`);
    if (sub) lines.push(`subdomain = ${tomlStr(sub)}`);
  }
  return `${lines.join('\n')}\n`;
}

/** 从静态配置推导手机访问 URL（tcp 可推导；raw 无法推导，留空由用户在状态里看日志）。 */
export function derivePublicUrl(config = {}) {
  const c = config;
  const raw = String(c.rawToml ?? '').trim();
  if (raw) return '';
  const addr = String(c.serverAddr ?? '').trim();
  const type = ['tcp', 'http', 'https'].includes(c.proxyType) ? c.proxyType : 'tcp';
  if (type === 'tcp') {
    const port = Number(c.remotePort) > 0 ? Number(c.remotePort) : 0;
    return addr && port ? `http://${addr}:${port}` : '';
  }
  const domain = String(c.customDomain ?? '').trim();
  if (!domain) return '';
  return type === 'https' ? `https://${domain}` : `http://${domain}`;
}

export const frp = {
  id: 'frp',
  label: 'frp',
  wantsAdminPort: true,

  docs: {
    zh: '复用你（或朋友）已有的 frp 服务：填 frps 地址、端口和 token 即可。支持纯端口映射（最通用）与 http/https 域名复用（需 frps 开 vhost 端口）。也可以直接粘贴完整 frpc.toml（高级）。',
    en: 'Reuse an existing frp server: fill in the frps address, port and token. Supports plain TCP port mapping (most universal) and http/https vhost (requires vhost ports on frps). Or paste a full frpc.toml (advanced).',
    download: {
      zh: 'frp 官方下载（国内源 gofrp.net，备用 GitHub Releases）：下载后把 frpc 放进 PATH 或在下方填写完整路径。',
      en: 'Download frp (gofrp.net mirror, or GitHub Releases), then put frpc on PATH or set the full path below.',
    },
    downloadUrl: 'https://gofrp.org/zh-cn/docs/download/',
  },

  resolveBin(config = {}) { return resolveBin(TOOL, config.binPath); },

  /** 纯函数：产出落盘文件与启动参数（不碰文件系统，便于单测）。 */
  launch({ config = {}, localPort, dir, adminPort }) {
    const toml = buildFrpcToml({ config, localPort, adminPort, logFile: join(dir, 'frpc.log') });
    return {
      args: ['-c', join(dir, 'frpc.toml')],
      env: null,
      files: [{ path: join(dir, 'frpc.toml'), content: toml }],
    };
  },

  /** 启动前预检：frpc verify 校验配置合法性（版本过老没有 verify 时跳过并提示）。 */
  async verify({ bin, files, spawnImpl }) {
    const toml = files?.find((f) => f.path.endsWith('.toml'));
    if (!toml) return { ok: true };
    return await new Promise((res) => {
      let out = '';
      let p;
      try {
        p = spawnImpl(bin, ['verify', '-c', toml.path], { timeout: 15_000 });
      } catch (err) {
        res({ ok: false, detail: `无法执行 frpc：${err.message}` });
        return;
      }
      p.stdout?.on('data', (d) => { out += d; });
      p.stderr?.on('data', (d) => { out += d; });
      p.on('error', (err) => {
        // 旧版 frpc 没有 verify 子命令：不阻塞启动，让进程自身报错暴露问题
        res({ ok: true, note: `frpc verify 不可用（${err.message}），跳过预检` });
      });
      p.on('exit', (code) => {
        if (code === 0) res({ ok: true });
        else res({ ok: false, detail: `frpc verify 校验失败：${out.trim().slice(-400) || `exit ${code}`}` });
      });
    });
  },

  derivePublicUrl,
};
