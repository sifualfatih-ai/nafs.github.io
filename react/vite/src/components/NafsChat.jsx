import { useState } from "react";

export default function NafsChat() {
  const API_BASE = "https://nafsgithubio-production.up.railway.app"; // ganti jika perlu
  const [text, setText] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": "public",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          stream: false,
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: text.trim() },
          ],
        }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setReply(data.choices?.[0]?.message?.content ?? "(no content)");
    } catch (err) {
      console.error(err);
      setReply("Gagal memanggil API.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 680, margin: "16px 0", padding: 12, border: "1px solid #333", borderRadius: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Chat (via OpenRouter)</div>
      <div style={{ whiteSpace: "pre-wrap", minHeight: 80, padding: 8, border: "1px solid #333", borderRadius: 8 }}>
        {reply || "— belum ada balasan —"}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" && !e.shiftKey ? (e.preventDefault(), send()) : null)}
          placeholder="Ketik pesan…"
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #333" }}
        />
        <button onClick={send} disabled={loading} style={{ padding: "10px 16px", borderRadius: 8 }}>
          {loading ? "Mengirim…" : "Kirim"}
        </button>
      </div>
    </div>
  );
}
