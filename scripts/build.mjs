#!/usr/bin/env node
// 构建所有需要预构建的产物，并做新鲜度校验（产物提交进仓库，DSH 插件安装不吃构建流程）：
//   packages/plugin/src/index.js      → lib/index.js     （host 自包含 bundle）
//   packages/plugin/client/settings.jsx → client/client.js （client bundle）
// 任一产物与源码不同步即失败，重建后的产物留在磁盘上供提交。

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const pluginDir = join(root, 'packages', 'plugin');

const artifacts = [
  { run: 'build-host.mjs', file: join(pluginDir, 'lib', 'index.js') },
  { run: join('client', 'build.mjs'), file: join(pluginDir, 'client', 'client.js') },
];

for (const { run, file } of artifacts) {
  let before = null;
  try { before = readFileSync(file, 'utf8'); } catch { /* 首次构建：产物尚不存在 */ }
  execFileSync(process.execPath, [join(pluginDir, run)], { cwd: pluginDir, stdio: 'inherit' });
  const after = readFileSync(file, 'utf8');
  if (before !== null && before !== after) {
    console.error([
      `build: ${file.replace(root, '')} drifted from its sources — the freshly built artifact is now on disk.`,
      'This means the committed artifact was stale. Inspect the diff and commit it:',
      `  git diff -- ${file.replace(root, '')}`,
    ].join('\n'));
    process.exit(2);
  }
}
console.log('build: all artifacts OK (in sync with sources)');
