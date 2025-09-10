import 'dotenv/config';
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
...(provider ? { provider } : { provider: { allow_fallbacks: true }})
};


try {
const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
method: 'POST',
headers: {
'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
'Content-Type': 'application/json',
'HTTP-Referer': OPENROUTER_REFERER,
'X-Title': OPENROUTER_TITLE
},
body: JSON.stringify(body)
});


// Stream or JSON passthrough
res.status(resp.status);
// copy headers useful for streaming
for (const [k, v] of resp.headers) {
if (k.toLowerCase().startsWith('content-') || k.toLowerCase().startsWith('transfer-')) {
res.setHeader(k, v);
}
}


const reader = resp.body.getReader();
const encoder = new TextEncoder();
const decoder = new TextDecoder();
while (true) {
const { value, done } = await reader.read();
if (done) break;
res.write(encoder.encode(decoder.decode(value)));
}
res.end();
} catch (err) {
console.error(err);
res.status(502).json({ error: 'bad_gateway', message: 'Failed to reach OpenRouter', detail: String(err) });
}
});


// === Generic passthrough for other OpenRouter endpoints (use carefully) ===
app.post('/api/openrouter/*', async (req, res) => {
const tenant = tenantFrom(req);
const gate = checkAndConsume(tenant);
if (!gate.ok) return res.status(gate.code).json({ error: gate.reason });


const subpath = req.path.replace('/api', '');
try {
const resp = await fetch(`https://openrouter.ai${subpath}`, {
method: 'POST',
headers: {
'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
'Content-Type': 'application/json',
'HTTP-Referer': OPENROUTER_REFERER,
'X-Title': OPENROUTER_TITLE
},
body: JSON.stringify(req.body || {})
});
res.status(resp.status).set('Content-Type', resp.headers.get('content-type') || 'application/json');
const text = await resp.text();
res.send(text);
} catch (e) {
console.error(e);
res.status(502).json({ error: 'bad_gateway', message: 'Proxy failed', detail: String(e) });
}
});


app.listen(PORT, () => console.log(`AI proxy listening on :${PORT}`));
