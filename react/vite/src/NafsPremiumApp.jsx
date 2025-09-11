import React from "react"; // <— WAJIB
import { BASE, HERE, HOMEPAGE_URL, LOGIN_URL, LOGOUT_URL, API_BASE, DEFAULT_MODEL, TENANT_ID } from "./config.js";

// komponen kecil & input
import { Badge, SideItem, SectionTitle, GhostInput } from "./components/Common.jsx";

// views
import CanvasAIView from "./views/CanvasAIView.jsx";
import GenerateImageView from "./views/GenerateImageView.jsx";
import GenerateVideoView from "./views/GenerateVideoView.jsx";
import GenerateAudioView from "./views/GenerateAudioView.jsx";
import PromoProdukView from "./views/PromoProdukView.jsx";
import TiktokAffiliateView from "./views/TiktokAffiliateView.jsx";
import IklanProdukView from "./views/IklanProdukView.jsx";
import ContentPlaceholder from "./views/Placeholder.jsx";
import TutorialView from "./views/TutorialView.jsx";
import SettingsView from "./views/SettingsView.jsx";


/* ===================== APP ===================== */
function NafsPremiumApp() {
  const [active, setActive] = React.useState("Chat");
  const [model, setModel] = React.useState("Gemini 2.5 Flash");
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  // ==== state untuk fitur Chat minimal ====
  const [chatText, setChatText] = React.useState("");
  const [chatReply, setChatReply] = React.useState("");
  const [chatLoading, setChatLoading] = React.useState(false);

  React.useEffect(() => {
    setIsLoggedIn(localStorage.getItem("nafs_isLoggedIn") === "1");
  }, []);

  async function sendChat() {
    if (!chatText.trim()) return;
    setChatLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-tenant-id": TENANT_ID },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          stream: false,
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user",   content: chatText.trim() }
          ]
        })
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content ?? "(no content)";
      setChatReply(content);
    } catch (e) {
      console.error(e);
      setChatReply("❌ Gagal memanggil API.");
    } finally {
      setChatLoading(false);
      setChatText("");
    }
  }

  const items = [
    { label: "Chat", icon: "💬" },
    { label: "Canvas AI", icon: "🗂️", right: <Badge>New</Badge> },
    { label: "Generate Image", icon: "🖼️" },
    { label: "Generate Video", icon: "🎬" },
    { label: "Generate Audio", icon: "🌊" },
    { label: "Promosi Produk", icon: "📣" },
    { label: "Tiktok Affiliate", icon: "🔗", right: <span className="text-[9px] text-white/50">Konten UGC</span> },
    { label: "Iklan Produk", icon: "📷", right: <span className="text-[9px] text-white/50">Konten UGC</span> },
  ];
  const secondary = [
    { label: "Tutorial", icon: "🎓", right: <span className="text-[9px] text-white/50">e-course</span> },
    { label: "Halaman Utama", icon: "🏠" },
    { label: "Settings", icon: "⚙️" },
  ];

  function handleClick(label) {
    if (!isLoggedIn && label !== "Halaman Utama") return;
    if (label === "Halaman Utama") { window.location.href = HOMEPAGE_URL; return; }
    setActive(label);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#2a0f4a] via-[#1a0b2e] to-[#0c0516] text-white">
      {!isLoggedIn && (
        <div className="fixed inset-0 z-40" aria-hidden="true" title="Silakan login untuk mengakses semua fitur" style={{ background: "transparent" }} />
      )}

      <div className="mx-auto max-w-[1400px] p-3 lg:p-6">
        <div className="flex gap-3 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-[190px] lg:w-[210px] shrink-0">
            <div className="sticky top-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-400 to-fuchsia-600 grid place-items-center shadow-lg">
                  <span>👑</span>
                </div>
                <div>
                  <div className="text-lg font-semibold tracking-wide">Nafs</div>
                  <div className="text-[11px] text-white/60 -mt-0.5">Premium</div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-purple-300">✨</span>
                  <span className="font-medium">{isLoggedIn ? "Premium Aktif" : "Akses Premium"}</span>
                </div>
                <p className="text-[11px] text-white/60 mt-2 leading-relaxed">
                  {isLoggedIn
                    ? "Langganan aktif. Nikmati semua fitur premium."
                    : <>Ini adalah laman premium. Silakan <b className="text-white">login & berlangganan</b> untuk mengakses seluruh fitur.</>}
                </p>

                <div className="mt-2 flex gap-2">
                  {!isLoggedIn ? (
                    <a href={LOGIN_URL} className="relative z-50 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-[12px]">🔐 Login</a>
                  ) : (
                    <a href={LOGOUT_URL} className="relative z-50 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 bg-white/10 hover:bg-white/20 text-[12px]">🚪 Keluar</a>
                  )}
                </div>
              </div>

              <SectionTitle>Menu</SectionTitle>
              <div className="space-y-1">
                {items.map((it) => (
                  <SideItem key={it.label} icon={it.icon} label={it.label} right={it.right}
                            active={active === it.label} onClick={() => handleClick(it.label)} dimmed={!isLoggedIn}/>
                ))}
              </div>

              <SectionTitle>Lainnya</SectionTitle>
              <div className="space-y-1">
                {secondary.map((it) => (
                  <SideItem key={it.label} icon={it.icon} label={it.label} right={it.right}
                            active={active === it.label} onClick={() => handleClick(it.label)}
                            elevate={!isLoggedIn && it.label === "Halaman Utama"}
                            dimmed={!isLoggedIn && it.label !== "Halaman Utama"}/>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 rounded-3xl border border-white/10 bg-white/5 min-h-[76vh] flex flex-col overflow-hidden">
            <div className="h-12 border-b border-white/10 px-4 flex items-center justify-between">
              <div className="text-sm text-white/70">{active === "Halaman Utama" ? "Web Utama (tanpa login)" : active}</div>
              <div className="flex items-center gap-2 text-xs text-white/50"><span>🌐</span><span>Halaman Khusus Langganan Premium</span></div>
            </div>

            {active === "Canvas AI" ? (
              <CanvasAIView />
            ) : active === "Generate Image" ? (
              <GenerateImageView isLoggedIn={isLoggedIn} model={model} setModel={setModel} loginUrl={LOGIN_URL} />
            ) : active === "Generate Video" ? (
              <GenerateVideoView isLoggedIn={isLoggedIn} model={model} setModel={setModel} loginUrl={LOGIN_URL} />
            ) : active === "Generate Audio" ? (
              <GenerateAudioView isLoggedIn={isLoggedIn} loginUrl={LOGIN_URL} />
            ) : active === "Promosi Produk" ? (
              <PromoProdukView isLoggedIn={isLoggedIn} loginUrl={LOGIN_URL} />
            ) : active === "Tiktok Affiliate" ? (
              <TiktokAffiliateView isLoggedIn={isLoggedIn} loginUrl={LOGIN_URL} />
            ) : active === "Iklan Produk" ? (
              <IklanProdukView isLoggedIn={isLoggedIn} loginUrl={LOGIN_URL} />
            ) : active === "Tutorial" ? (
              <TutorialView />
            ) : active === "Settings" ? (
              <SettingsView />
            ) : (
              <ContentPlaceholder current={active} />
            )}

            {active === "Chat" && (
              <div className="border-t border-white/10 p-3">
                <div className="grid gap-3">
                  <div className="rounded-xl border border-white/10 p-3 bg-white/10 text-white/90 min-h-[88px] whitespace-pre-wrap">
                    {chatReply || "— belum ada balasan —"}
                  </div>

                  <div className="flex flex-col lg:flex-row items-stretch gap-3">
                    <div className="flex-1">
                      <GhostInput as="textarea" rows={4}
                        placeholder={isLoggedIn ? "Ketik pesan untuk mulai chat…" : "Silakan login untuk memulai chat."}
                        value={chatText} onChange={(e)=>setChatText(e.target.value)}
                        disabled={!isLoggedIn || chatLoading} className="bg-white/10"/>
                    </div>

                    <div className="w-full lg:w-auto grid place-items-center">
                      {!isLoggedIn ? (
                        <a href={LOGIN_URL} className="relative z-50 inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow-lg">🔐 Login untuk Menggunakan Chat</a>
                      ) : (
                        <button onClick={sendChat} disabled={chatLoading}
                          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow-lg disabled:opacity-60">
                          {chatLoading ? "Mengirim…" : "💬 Kirim"}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[11px] text-white/50">
                    <span>🪄</span>
                    <span>{isLoggedIn ? "Anda sudah login Premium." : "Berlangganan diperlukan untuk akses penuh."}</span>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default NafsPremiumApp;
window.NafsPremiumApp = NafsPremiumApp;
