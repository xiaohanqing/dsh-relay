#!/usr/bin/env node
// 语法检查全部源码（CI 与本地统一入口）。
// 规则：packages 下所有 .mjs/.js 参与 node --check，
//      排除 node_modules、构建产物 client/client.js、test-local 产物。

import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const SKIP_DIRS = new Set(['node_modules', '.git', 'test-local', 'lib']); // lib/ 为 host 构建产物
const SKIP_FILES = new Set(['client.js']); // esbuild 构建产物，非手写源码

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    let st;
    try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name)) walk(p, out);
    } else if (/\.(mjs|js)$/.test(name) && !SKIP_FILES.has(name)) {
      out.push(p);
    }
  }
  return out;
}

const files = walk(root);
if (files.length === 0) {
  console.error('check: no source files found — something is wrong');
  process.exit(1);
}
const failed = [];
for (const f of files) {
  try {
    execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
  } catch (err) {
    failed.push({ f, msg: String(err.stderr ?? err) });
  }
}
console.log(`check: ${files.length - failed.length}/${files.length} files OK`);
if (failed.length) {
  for (const { f, msg } of failed) {
    console.error(`\n✗ ${relative(root, f)}\n${msg}`);
  }
  process.exit(1);
}
