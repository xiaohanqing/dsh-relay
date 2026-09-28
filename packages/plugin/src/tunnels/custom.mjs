// 自定义命令适配器——万能兜底：任何没做深度适配的隧道工具（bore / rathole / nps /
// cpolar / 花生壳 / 未来新工具）都能用「命令模板 + 可选配置文件模板」接入。
//
// 占位符：
//   {{port}}       → 稳定隧道注入口端口号（如 3083）
//   {{configFile}} → 由配置文件模板渲染出的文件路径（未填模板时为空串）
//
// 命令按 shell 词法切分（支持单双引号），不带 shell 执行，杜绝注入面。

import { join } from 'node:path';
import { resolveBin } from './resolve-bin.mjs';

/** shell 词法切分：支持单/双引号与反斜杠转义。纯函数，单测覆盖。 */
export function splitCommand(line) {
  const out = [];
  let cur = '';
  let has = false;
  let q = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '\\' && q === '"' && i + 1 < line.length) { cur += line[++i]; continue; }
      if (ch === q) { q = null; continue; }
      cur += ch;
      continue;
    }
    if (ch === '"' || ch === "'") { q = ch; has = true; continue; }
    if (ch === '\\' && i + 1 < line.length) { cur += line[++i]; has = true; continue; } // shell 转义
    if (ch === ' ' || ch === '\t') { if (has || cur) { out.push(cur); cur = ''; has = false; } continue; }
    cur += ch;
    has = true;
  }
  if (q) throw new Error('命令里的引号没有闭合 | unclosed quote in command');
  if (has || cur) out.push(cur);
  return out;
}

export const custom = {
  id: 'custom',
  label: 'Custom command',
  wantsAdminPort: false,

  docs: {
    zh: '任何隧道工具都能接：填启动命令（支持 {{port}} / {{configFile}} 占位符），可选配置文件模板。例：bore local {{port}} --to bore.pub；rathole client.toml（配置模板里写 local_port = {{port}}）。',
    en: 'Bring any tunnel tool: provide the launch command (supports {{port}} / {{configFile}} placeholders) and an optional config file template.',
    download: {
      zh: '自行准备目标工具的二进制，命令里直接写完整路径最稳妥。',
      en: 'Prepare the tool binary yourself; prefer the full path in the command.',
    },
    downloadUrl: '',
  },

  /**
   * 命令首词即二进制：裸名走 PATH 解析，绝对/相对路径校验存在性。
   * config.binPath 覆盖首词。
   */
  resolveBin(config = {}) {
    const cmd = String(config.command ?? '').trim();
    if (!cmd) return { bin: null, reason: '请填写启动命令 | launch command required' };
    let words;
    try { words = splitCommand(cmd); } catch (err) { return { bin: null, reason: err.message }; }
    if (!words.length) return { bin: null, reason: '启动命令为空 | empty command' };
    const bare = words[0];
    if (config.binPath) return resolveBin(bare, config.binPath);
    if (/[/\\]/.test(bare)) return resolveBin(bare, bare);
    return resolveBin(bare, '');
  },

  launch({ config = {}, localPort, dir }) {
    const cmd = String(config.command ?? '').trim();
    if (!cmd) throw new Error('请填写启动命令 | launch command required');
    let configFile = '';
    const files = [];
    const template = String(config.configTemplate ?? '');
    if (template.trim()) {
      const fileName = String(config.configFileName ?? '').trim() || 'custom-config.txt';
      configFile = join(dir, fileName.replace(/[^\w.-]+/g, '_'));
      files.push({ path: configFile, content: template.replaceAll('{{port}}', String(localPort)) });
    }
    const rendered = cmd
      .replaceAll('{{port}}', String(localPort))
      .replaceAll('{{configFile}}', configFile);
    const words = splitCommand(rendered);
    if (!words.length) throw new Error('启动命令为空 | empty command');
    // 契约：spawn(bin, args) 的 args 不含程序名（words[0] 已由 resolveBin 解析为 bin）
    return { args: words.slice(1), env: null, files };
  },

  parseLine() { return null; },

  derivePublicUrl(config = {}) {
    // 用户可直接声明结果 URL（用于二维码展示），无法验证，仅展示
    return String(config.publicUrl ?? '').trim();
  },
};
