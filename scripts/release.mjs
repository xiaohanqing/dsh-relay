#!/usr/bin/env node
// 双包版本联动发布：
//   node scripts/release.mjs 0.4.0        （写版本 + 更新各包 + 提交 + 打 tag）
//   node scripts/release.mjs 0.4.0 --dry  （只看会改什么）
// 两包（plugin / server）版本号必须一致；CHANGELOG.md 必须已包含该版本条目。

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const [version] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const dry = process.argv.includes('--dry');

if (!version || !/^\d+\.\d+\.\d+(-[\w.]+)?$/.test(version)) {
  console.error('usage: node scripts/release.mjs <x.y.z> [--dry]');
  process.exit(1);
}

const packages = ['packages/plugin', 'packages/server'];
const versions = new Set();
for (const dir of packages) {
  const pkg = JSON.parse(readFileSync(join(root, dir, 'package.json'), 'utf8'));
  versions.add(pkg.version);
}
if (versions.size !== 1) {
  console.error(`release: package versions diverge (${[...versions].join(', ')}) — align first`);
  process.exit(1);
}
const current = [...versions][0];

const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
if (!changelog.includes(`## [${version}]`) && !changelog.includes(`## ${version}`)) {
  console.error(`release: CHANGELOG.md has no entry for ${version} — write it first`);
  process.exit(1);
}

const edits = packages.map((dir) => {
  const path = join(root, dir, 'package.json');
  const before = readFileSync(path, 'utf8');
  const after = before.replace(
    new RegExp(`("version":\\s*)"${current.replace(/\./g, '\\.')}"`),
    `$1"${version}"`,
  );
  if (before === after) throw new Error(`version ${current} not found in ${dir}/package.json`);
  return { path, before, after };
});

console.log(`release: ${current} -> ${version}${dry ? ' (dry run)' : ''}`);
for (const { path } of edits) console.log(`  ${path.replace(root, '')}`);
if (dry) process.exit(0);

for (const { path, after } of edits) writeFileSync(path, after, 'utf8');
const run = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: 'inherit' });
run('git', ['add', ...packages.map((d) => `${d}/package.json`)]);
run('git', ['commit', '-m', `release: v${version}`]);
run('git', ['tag', `v${version}`]);
console.log(`release: committed and tagged v${version} (push with: git push origin main --follow-tags)`);
