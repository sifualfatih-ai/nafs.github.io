# AI Proxy (OpenRouter – Option 2)


## 1) Setup
- `cp .env.example .env` lalu isi `OPENROUTER_API_KEY` dari dashboard OpenRouter.
- `npm install`
- `npm run dev`


## 2) Panggil dari frontend
```ts
// contoh fetch streaming SSE dari browser (Next.js/React)
const resp = await fetch("/api/chat", {
method: "POST",
headers: { "Content-Type": "application/json", "x-tenant-id": userId },
body: JSON.stringify({
model: "openai/gpt-4o-mini",
stream: true,
messages: [
{ role: "system", content: "You are a helpful assistant" },
{ role: "user", content: "Hello" }
]
})
});
// baca stream sesuai util/reader di app kamu
