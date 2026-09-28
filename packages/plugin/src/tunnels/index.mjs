// 隧道适配器注册表

import { frp } from './frp.mjs';
import { cloudflared } from './cloudflared.mjs';
import { natapp } from './natapp.mjs';
import { custom } from './custom.mjs';

export const ADAPTERS = { frp, cloudflared, natapp, custom };

export function getAdapter(id) {
  return ADAPTERS[id] ?? null;
}

export function listAdapters() {
  return Object.values(ADAPTERS);
}
