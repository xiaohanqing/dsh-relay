// cloudflared 适配器（Cloudflare Tunnel）——最省事路径：quick tunnel 免账号，
// 一条命令拿到 https://xxx.trycloudflare.com 临时域名（进程退出即失效）。
// named tunnel：填 tunnel token（Cloudflare Zero Trust 控制台获取），域名固定。
// 注意：国内部分网络访问 Cloudflare 边缘不稳定，UI 应提示。

import { resolveBin } from './resolve-bin.mjs';

const QUICK_URL_RE = /(https:\/\/[a-z0-9-]+\.trycloudflare\.com)/i;

export const cloudflared = {
  id: 'cloudflared',
  label: 'Cloudflare Tunnel',
  wantsAdminPort: false,

  docs: {
    zh: '无需任何服务器与账号（quick 模式）：启动即得一个临时 HTTPS 域名。适合「就是不想部署」的场景；缺点是域名随机、国内连通性看网络环境。有 Cloudflare 账号可填 tunnel token 获得固定域名。',
    en: 'No server, no account needed (quick mode): get a temporary HTTPS URL instantly. Fixed domain available with a Cloudflare tunnel token.',
    download: {
      zh: '从 Cloudflare 官网下载 cloudflared 单文件二进制，放进 PATH 或在下方填写完整路径。',
      en: 'Download the cloudflared binary from Cloudflare, put it on PATH or set the full path below.',
    },
    downloadUrl: 'https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/',
  },

  resolveBin(config = {}) { return resolveBin('cloudflared', config.binPath); },

  launch({ config = {}, localPort }) {
    const token = String(config.token ?? '').trim();
    if (token) {
      return {
        args: ['tunnel', '--no-autoupdate', 'run'],
        env: { TUNNEL_TOKEN: token },
        files: [],
      };
    }
    return {
      args: ['tunnel', '--no-autoupdate', '--url', `http://127.0.0.1:${localPort}`],
      env: null,
      files: [],
    };
  },

  /** 从输出行提取 quick tunnel 域名。 */
  parseLine(line) {
    const m = QUICK_URL_RE.exec(String(line ?? ''));
    return m ? { publicUrl: m[1] } : null;
  },

  derivePublicUrl() { return ''; }, // 动态分配，只能从日志拿
};
