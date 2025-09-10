import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { fetch } from 'undici';

// === Config ===
const PORT = process.env.PORT || 8787;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_REFERER = process.env.OPENROUTER_REFERER || 'https://your-domain.example';
const OPENROUTER_TITLE = process.env.OPENROUTER_TITLE || 'Your App Name';

// CORS: dukung banyak origin dipisah koma (mis: "https://nafsflow.com,https://nafs.github.io")
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';
const ALLOWED_ORIGINS = FRONTEND_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);

// Per-tenant controls
const TENANT_HEADER = process.env.TENANT_HEADER || 'x-tenant-id';
const RATE_LIMIT_RPM = Number(process.env.RATE_LIMIT_RPM || 60); // requests per minute per tenant
const DAILY_QUOTA = Number(process.env.DAILY_QUOTA || 2000);     // requests per day per tenant

if (!OPENROUTER_API_KEY) {
  console.error('Missing OPENROUTER_API_KEY');
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: '3mb' }));
app.use(morgan('tiny'));

// CORS middleware
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // non-browser / curl
    const ok = ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin);
    cb(ok ? null : new Error('Not allowed by CORS'), ok);
  },
  credentials: true
}));

// === In-memory rate/quota (swap to Redis in production) ===
const buckets = new Map(); // tenant => { minuteWindowStart, countInWindow, dayStart, dailyCount }

function now() { return Date.now(); }
function startOfMinute(ts) { return Math.floor(ts / 60000) * 60000; }
function startOfDay(ts) { const d = new Date(ts); d.setUTCHours(0,0,0,0); return d.getTime(); }

function checkAndConsume(tenant) {
  const ts = now();
  const m0 = startOfMinute(ts);
  const d0 = startOfDay(ts);
  let s = buckets.get(tenant);
  if (!s) {
    s = { minuteWindowStart: m0, countInWindow: 0, dayStart: d0, dailyCount: 0 };
    buckets.set(tenant, s);
  }

  if (s.minuteWindowStart !== m0) { s.minuteWindowStart = m0; s.countInWindow = 0; }
  if (s.dayStart !== d0) { s.dayStart = d0; s.dailyCount = 0; }

  if (s.countInWindow >= RATE_LIMIT_RPM) return { ok: false, code: 429, reason: 'rate_limit' };
  if (s.dailyCount >= DAILY_QUOTA) return { ok: false, code: 429, reason: 'daily_quota' };

  s.countInWindow += 1;
  s.dailyCount += 1;
  return { ok: true };
}

function tenantFrom(req) {
  return req.header(TENANT_HEADER) || 'public';
}

// === Health & metadata ===
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get('/meta', (_req, res) => {
  res.json({ tenantHeader: TENANT_HEADER, rateLimitRpm: RATE_LIMIT_RPM, dailyQuota: DAILY_QUOTA });
});

// === Core proxy: chat completions ===
app.post('/api/chat', async (req, res) => {
  const tenant = tenantFrom(req);
  const gate = checkAndConsume(tenant);
  if (!gate.ok) {
    return res
      .status(gate.code)
      .json({ error: gate.reason, message: gate.reason === 'rate_limit' ? 'Rate limit exceeded' : 'Daily quota exceeded' });
  }

  const {
    model = 'openai/gpt-4o-mini',
    messages = [],
    stream = true,
    temperature,
    max_tokens,
    provider
  } = req.body || {};

  const body = {
    model,
    messages,
    stream,
    ...(temperature !== undefined ? { temperature } : {}),
    ...(max_tokens !== undefined ? { max_tokens } : {}),
    ...(provider ? { provider } : { provider: { allow_fallbacks: true } })
  };

  try {
    const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': OPENROUTER_REFERER,
        'X-Title': OPENROUTER_TITLE,
        'Accept-Encoding': 'identity' // hindari kompresi upstream
      },
      body: JSON.stringify(body)
    });

    res.status(resp.status);
    // hanya teruskan header aman; skip encoding & length agar browser tidak salah decoding
    for (const [k, v] of resp.headers) {
      const kl = k.toLowerCase();
      if (kl.startsWith('content-') || kl.startsWith('transfer-')) {
        if (kl === 'content-encoding' || kl === 'content-length') continue;
        res.setHeader(k, v);
      }
    }

    // Streaming passthrough bila tersedia
    if (resp.body && resp.body.getReader) {
      const reader = resp.body.getReader();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        res.write(value);
      }
      return res.end();
    }

    // Fallback non-stream
    const text = await resp.text();
    res.send(text);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'bad_gateway', message: 'Failed to reach OpenRouter', detail: String(err) });
  }
});

// === Generic passthrough for other OpenRouter endpoints ===
app.post('/api/openrouter/*', async (req, res) => {
  const tenant = tenantFrom(req);
  const gate = checkAndConsume(tenant);
  if (!gate.ok) return res.status(gate.code).json({ error: gate.reason });

  const subpath = req.path.replace('/api', '');
  try {
    const resp = await fetch(`https://openrouter.ai${subpath}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': OPENROUTER_REFERER,
        'X-Title': OPENROUTER_TITLE,
        'Accept-Encoding': 'identity'
      },
      body: JSON.stringify(req.body || {})
    });

    res.status(resp.status);
    const ct = resp.headers.get('content-type') || 'application/json';
    res.setHeader('Content-Type', ct);
    for (const [k, v] of resp.headers) {
      const kl = k.toLowerCase();
      if (kl.startsWith('content-') || kl.startsWith('transfer-')) {
        if (kl === 'content-encoding' || kl === 'content-length') continue;
        res.setHeader(k, v);
      }
    }
    const text = await resp.text();
    res.send(text);
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: 'bad_gateway', message: 'Proxy failed', detail: String(e) });
  }
});

app.listen(PORT, () => console.log(`AI proxy listening on :${PORT}`));
