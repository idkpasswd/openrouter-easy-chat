// 后端：零依赖 Node 服务器（Node 18+）
// 提供网页 public/index.html，并把 /api/chat 转发到 OpenRouter（流式返回）
// Key：优先用网页里填的；没填就用环境变量 OPENROUTER_API_KEY（可在 Codespaces Secrets 里设置）
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

const PORT = process.env.PORT || 3000;
const ALLOWED_MODELS = [
  'nvidia/nemotron-3.5-super-vl:free',
  'nvidia/nemotron-3.5-lightning:free',
  'nvidia/nemotron-3.5-super-vl',
  'nvidia/nemotron-nano-12b-v2-vl',
  'nvidia/nemotron-nano-12b-v2-vl:free',
];

function sendJson(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ error: { message } }));
}

async function handleChat(req, res) {
  const userKey = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const key = userKey || process.env.OPENROUTER_API_KEY;
  if (!key) return sendJson(res, 401, '没有 API Key：请在网页左下角填写，或在 Codespaces Secrets 设置 OPENROUTER_API_KEY');

  let raw = '';
  for await (const chunk of req) raw += chunk;
  let body;
  try { body = JSON.parse(raw); } catch { return sendJson(res, 400, '请求格式错误'); }
  if (!userKey && !ALLOWED_MODELS.includes(body.model)) return sendJson(res, 400, '不允许的模型：' + body.model);

  let upstream;
  try {
    upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + key,
        'Content-Type': 'application/json',
        'X-Title': 'Nemotron Chat',
      },
      body: JSON.stringify({ model: body.model, messages: body.messages, stream: body.stream !== false }),
    });
  } catch (e) {
    return sendJson(res, 502, '后端连不上 OpenRouter：' + e.message);
  }

  res.writeHead(upstream.status, {
    'Content-Type': upstream.headers.get('content-type') || 'text/event-stream',
    'Cache-Control': 'no-cache',
    'X-Accel-Buffering': 'no',
  });
  if (!upstream.body) return res.end();
  const stream = Readable.fromWeb(upstream.body);
  req.on('close', () => stream.destroy());
  stream.on('error', () => res.end());
  stream.pipe(res);
}

http.createServer((req, res) => {
  if (req.url.startsWith('/api/chat')) {
    if (req.method !== 'POST') return sendJson(res, 405, '只支持 POST');
    return handleChat(req, res).catch(e => sendJson(res, 500, e.message));
  }
  if (req.method === 'GET' && (req.url === '/' || req.url.startsWith('/?') || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.createReadStream(path.join(__dirname, 'public', 'index.html')).pipe(res);
  }
  res.writeHead(404); res.end('Not found');
}).listen(PORT, () => console.log(`Nemotron Chat 已启动：端口 ${PORT}`));
