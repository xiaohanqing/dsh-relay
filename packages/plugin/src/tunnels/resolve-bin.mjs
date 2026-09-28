// 隧道二进制定位：设置里手动指定 → PATH 逐目录 → 插件托管下载目录（预留）。
// 跨平台：Windows 下依次尝试 name.exe / name.cmd / name.bat / name。

import { existsSync, accessSync, constants as fsConstants } from 'node:fs';
import net from 'node:net';
import { delimiter, isAbsolute, join, resolve as resolvePath } from 'node:path';
import { homedir, platform } from 'node:os';

function isExecutable(p) {
  try { accessSync(p, fsConstants.X_OK); return existsSync(p); } catch { return false; }
}

/**
 * 定位可执行文件。
 * @param {string} name     二进制名（如 'frpc'）
 * @param {string} override 用户在设置里手动填的绝对路径（优先）
 * @returns {{bin: string} | {bin: null, reason: string}}
 */
export function resolveBin(name, override = '') {
  const exeNames = platform() === 'win32' ? [`${name}.exe`, `${name}.cmd`, `${name}.bat`, name] : [name];
  const o = String(override ?? '').trim();
  if (o) {
    const p = resolvePath(o);
    if (existsSync(p) && isExecutable(p)) return { bin: p };
    return { bin: null, reason: `指定的程序路径不存在或不可执行：${o} | overridden binary not found or not executable` };
  }
  const dirs = [
    ...(process.env.PATH ?? '').split(delimiter).filter(Boolean),
    join(homedir(), '.dsh', 'dsh-relay', 'bin'), // 插件托管下载目录（预留）
  ];
  for (const dir of dirs) {
    for (const n of exeNames) {
      const p = isAbsolute(n) ? n : join(dir, n);
      if (existsSync(p) && isExecutable(p)) return { bin: p };
    }
  }
  return { bin: null, reason: `未找到 ${name}：请安装后重试，或在设置里手动填写完整路径 | ${name} not found in PATH; install it or set the full path in settings` };
}

/** 借助 net 找一个当前空闲的回环端口（先到先得，存在竞态，仅用于探活/管理口等非关键场景）。 */
export function freeLoopbackPort() {
  return new Promise((res, rej) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', rej);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => res(port));
    });
  });
}
