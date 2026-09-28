// natapp 适配器——国内兜底：注册即用、国内节点速度快。
// 免费隧道：1Mbps 带宽 / 2GiB 每月 / 随机域名（官网口径，随时可能调整）。
// 用法：在 natapp.cn 复制隧道 authtoken → `natapp -authtoken=xxx -log=stdout`。
// 输出是转发表格（`http://xxx.natappfree.cc -> 127.0.0.1:8080`），从中提取公网 URL。

import { resolveBin } from './resolve-bin.mjs';

const FWD_URL_RE = /(https?:\/\/[^\s"'<>]+)\s*->/;

export const natapp = {
  id: 'natapp',
  label: 'natapp',
  wantsAdminPort: false,

  docs: {
    zh: '国内穿透服务（ natapp.cn ）：注册后在后台复制隧道 authtoken 填入即可。免费隧道限 1Mbps 带宽、随机域名；付费隧道更快、域名固定。',
    en: 'China-friendly tunnel service: paste the tunnel authtoken from natapp.cn. Free tunnels are 1Mbps with random domains.',
    download: {
      zh: '从 natapp.cn 下载客户端，放进 PATH 或在下方填写完整路径。',
      en: 'Download the natapp client from natapp.cn, put it on PATH or set the full path below.',
    },
    downloadUrl: 'https://natapp.cn/#download',
  },

  resolveBin(config = {}) { return resolveBin('natapp', config.binPath); },

  launch({ config = {}, localPort }) {
    const token = String(config.authtoken ?? '').trim();
    if (!token) throw new Error('请填写 natapp 隧道 authtoken | natapp authtoken required');
    return {
      args: [`-authtoken=${token}`, '-log=stdout'],
      env: null,
      files: [],
    };
  },

  parseLine(line) {
    const m = FWD_URL_RE.exec(String(line ?? ''));
    return m ? { publicUrl: m[1] } : null;
  },

  derivePublicUrl() { return ''; },
};
