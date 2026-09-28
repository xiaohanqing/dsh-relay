// dsh-relay host 侧打包：src/index.js → lib/index.js（自包含单文件）
//
// 为什么打包：插件包以物理目录被 `dsh plugin add` 消费（拷贝或链接），不能依赖
// 包内 node_modules。把运行时依赖（ws / qrcode）打进 lib/index.js 后，插件包
// 零运行时依赖，两种安装方式都成立。产物 lib/index.js 提交进仓库。
// 注意：import.meta.url 在产物中指向 lib/index.js，index.js 里 ../package.json
// 的版本读取恰好落回包根——这是刻意的，勿改成别的相对层级。

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const packageRoot = dirname(fileURLToPath(import.meta.url)); // build-host.mjs 位于包根
const outputPath = resolve(packageRoot, 'lib/index.js');

const result = await build({
  entryPoints: [resolve(packageRoot, 'src/index.js')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: ['node22'],
  // Node 内置模块自动 external；ws/qrcode 打进产物
  sourcemap: false,
  minify: false,          // 产物需可读可排障，不压缩
  legalComments: 'none',
  write: false,
  banner: {
    js: [
      '// dsh-relay host bundle — generated from src/ by build-host.mjs. DO NOT EDIT.',
      '// Source of truth: packages/plugin/src/ ; rebuild: pnpm build (repo root)',
      // CJS 依赖（ws/qrcode）打进 ESM 产物后，其对 Node 内置模块的 require 需要这个垫片
      `import { createRequire as __cjs_createRequire } from 'node:module';`,
      `const require = __cjs_createRequire(import.meta.url);`,
    ].join('\n'),
  },
});

const bundled = result.outputFiles?.[0]?.text;
if (!bundled) throw new Error('esbuild produced no output');
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, bundled, 'utf8');
console.log(`Wrote ${outputPath} (${(bundled.length / 1024).toFixed(1)} KB)`);

// 冒烟：产物必须能加载并导出插件契约
const mod = await import(outputPath);
if (mod.name !== 'dsh-relay' || typeof mod.apply !== 'function' || !Array.isArray(mod.inject)) {
  throw new Error('host bundle smoke failed: bad exports');
}
console.log('host bundle smoke OK (name/apply/inject exports verified)');
