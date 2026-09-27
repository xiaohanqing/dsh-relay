// dsh-relay RPC：设置页 ⇄ Host 控制通道（POST /dsh-relay/<endpoint>）
//
// 挂在插件自己 inject 的 webServer 上，用 ctx.connection.requestRejection(req) 做
// 401/403 信任栅栏（必须以方法形式调用，this 指向不能丢）。wire 格式遵循 DSH 的
// client-request / server-response 信封：{rpcId, method, payload} → {type:'server-response', rpcId, result}。

const LOOPBACK = new Set(['127.0.0.1', 'localhost', '::1']);
const BODY_MAX = 8 * 1024 * 1024;
const SEGMENT_RE = /^[A-Za-z0-9_$.-]+$/;

function ok(value) { return { ok: true, value }; }
function fail(message) {
  return { ok: false, error: { code: 'bad-request', message, details: { issues: [{ message }] } } };
}

function endpointFromPath(channel, pathname) {
  if (!pathname.startsWith(`${channel}/`)) return undefined;
  const endpoint = pathname.slice(channel.length + 1);
  if (endpoint.split('/').some((seg) => seg === '' || seg === '.' || seg === '..' || !SEGMENT_RE.test(seg))) return undefined;
  return endpoint;
}

/** 旧版 dsh 兜底栅栏：仅 loopback。 */
function trustedLoopback(req) {
  const host = String(req.headers?.host ?? '');
  if (!LOOPBACK.has(host.split(':')[0])) return false;
  if (req.headers['sec-fetch-site'] === 'cross-site') return false;
  const origin = req.headers.origin;
  if (origin === undefined) return true;
  try { return new URL(origin).host === host; } catch { return false; }
}

/**
 * @param {object} opts
 * @param {string} opts.channel  如 '/dsh-relay'
 * @param {(endpoint: string, payload: object, signal: AbortSignal) => Promise<object>} opts.handler
 */
export function installRpc(ctx, { channel, handler, log = console }) {
  const webServer = ctx?.webServer;
  if (!webServer || typeof webServer.register !== 'function') {
    log.warn?.('dsh-relay: webServer unavailable — settings page disabled | 无 webServer，设置页不可用');
    return () => {};
  }

  async function bridge(req, res) {
    const abort = new AbortController();
    res.on('close', () => { if (!res.writableEnded) abort.abort(); });

    const declared = Number(req.headers['content-length'] ?? 0);
    if (declared > BODY_MAX) {
      res.writeHead(413).end();
      req.destroy();
      return;
    }
    const chunks = [];
    let received = 0;
    for await (const chunk of req) {
      received += chunk.length;
      if (received > BODY_MAX) { res.writeHead(413).end(); req.destroy(); return; }
      chunks.push(chunk);
    }

    let result;
    const url = `http://${req.headers.host ?? '127.0.0.1'}${req.url}`;
    try {
      const mediaType = String(req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase();
      const endpoint = endpointFromPath(channel, new URL(req.url, 'http://x').pathname);
      if (req.method !== 'POST' || endpoint === undefined) {
        res.writeHead(404).end('not found');
        return;
      }
      if (mediaType !== 'application/json') {
        res.writeHead(415).end('content type must be application/json');
        return;
      }
      let body;
      try { body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch {
        res.writeHead(400).end('body is not JSON');
        return;
      }
      const rpcId = typeof body?.rpcId === 'string' ? body.rpcId : 'invalid-request';
      const method = typeof body?.method === 'string' ? body.method : null;
      if (rpcId === 'invalid-request' || method === null || method !== endpoint) {
        result = { ok: false, error: { code: 'bad-request', message: 'invalid client-request', details: { issues: [] } } };
      } else {
        try {
          result = await handler(endpoint, body.payload ?? {}, abort.signal);
        } catch (err) {
          log.error?.('dsh-relay: rpc %s failed | RPC 失败: %s', endpoint, err?.message ?? err);
          result = fail(err?.message ?? String(err));
        }
      }
      const payload = JSON.stringify({ type: 'server-response', rpcId, result });
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(payload);
    } catch (err) {
      // bridge 层异常：能回就回 500
      try { res.writeHead(500).end(`handler failure: ${String(err)}`); } catch { /* 已发送 */ }
    }
  }

  const route = {
    kind: 'prefix',
    path: channel,
    handler: async (req, res) => {
      let rejection;
      const connection = ctx?.connection;
      if (typeof connection?.requestRejection === 'function') {
        try { rejection = connection.requestRejection(req); } catch { rejection = 403; }
      } else if (!trustedLoopback(req)) {
        rejection = 403;
      }
      if (rejection !== undefined) {
        res.writeHead(rejection, { 'content-type': 'text/plain; charset=utf-8' });
        res.end(rejection === 401 ? 'unauthorized' : 'forbidden');
        return;
      }
      await bridge(req, res);
    },
  };

  const registered = webServer.register(route);
  if (typeof registered === 'function') return () => { try { registered(); } catch { /* 忽略 */ } };
  if (registered && typeof registered.then === 'function') {
    return async () => { try { const d = await registered; if (typeof d === 'function') d(); } catch { /* 忽略 */ } };
  }
  return () => {};
}
