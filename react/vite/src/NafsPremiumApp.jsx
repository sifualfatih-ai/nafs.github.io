/* ---- KONFIG URL ABSOLUT GITHUB PAGES ---- */
const BASE = "https://nafsflow.com/";
const HERE = "https://nafsflow.com/react/vite/";

const HOMEPAGE_URL = BASE;
const LOGIN_URL  = BASE + `?login=1&r=${encodeURIComponent(HERE)}`;
const LOGOUT_URL = BASE + `?logout=1&r=${encodeURIComponent(HERE)}`;

/* ==== UI KOMPONEN ==== */
function Badge({ children }) {
  return (
    <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full border bg-purple-500/10 text-purple-300 border-purple-400/30">
      {children}
    </span>
  );
}

function SideItem({ icon, label, right, active, onClick, elevate = false, dimmed = false }) {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-2 p-2.5 rounded-xl text-left transition-all
        hover:bg-white/5 ${active ? "bg-white/10 ring-1 ring-white/10" : ""}
        ${elevate ? "relative z-50" : ""} ${dimmed ? "opacity-60" : ""}`}
    >
      <span className="h-4 w-4 text-white/80">{icon}</span>
      <span className="text-[13px] text-white/90">{label}</span>
      <span className="ml-auto">{right}</span>
    </button>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/50 px-2 mt-6 mb-2">
      <span>{children}</span>
      <span className="text-white/50">▾</span>
    </div>
  );
}

function ModelSelect({ value, onChange, disabled }) {
  const models = ["Gemini 2.5 Flash", "GPT-5 Thinking", "Llama 3.1", "Claude 3.5 Sonnet"];
  return (
    <div className="w-full">
      <label className="text-xs text-white/60">Model</label>
      <div className="relative mt-1">
        <select
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-3 py-2 pr-9 text-sm text-white/90 focus:outline-none
            ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {models.map((m) => (
            <option key={m} className="bg-[#1a0b2e]" value={m}>
              {m}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">▾</span>
      </div>
    </div>
  );
}

function ContentPlaceholder({ current }) {
  return (
    <div className="flex-1 grid place-items-center">
      <div className="text-center">
        <p className="text-white/60 text-sm">Mulai percakapan dengan mengetik di bawah.</p>
        <p className="mt-2 text-xs text-white/40">
          Tampilan untuk <span className="text-white/70">{current}</span> akan diisi materi visualnya kemudian.
        </p>
      </div>
    </div>
  );
}

function NafsPremiumApp() {
  const [active, setActive] = React.useState("Chat");
  const [model, setModel] = React.useState("Gemini 2.5 Flash");
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    setIsLoggedIn(localStorage.getItem("nafs_isLoggedIn") === "1");
  }, []);

  const items = [
    { label: "Chat", icon: "💬" },
    { label: "Canvas AI", icon: "🗂️", right: <Badge>New</Badge> },
    { label: "Generate Image", icon: "🖼️" },
    { label: "Generate Video", icon: "🎬" },
    { label: "Generate Audio", icon: "📣" },
    { label: "Tiktok Affiliate", icon: "🔗", right: <span className="text-[10px] text-white/50">Konten UGC</span> },
    { label: "Iklan Produk", icon: "📷", right: <span className="text-[10px] text-white/50">Konten UGC</span> },
  ];
  const secondary = [
    { label: "Web3 Project", icon: "🎓", right: <Badge>e-course</Badge> },
    { label: "Workflow Bot", icon: "🗂️", right: 
    { label: "Halaman Utama", icon: "🏠" },
    { label: "Settings", icon: "⚙️" },
  ];

  function handleClick(label) {
    if (!isLoggedIn && label !== "Halaman Utama") return; // freeze saat belum login
    if (label === "Halaman Utama") {
      window.location.href = HOMEPAGE_URL;
      return;
    }
    setActive(label);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#2a0f4a] via-[#1a0b2e] to-[#0c0516] text-white">
      {/* ====== OVERLAY PEMBEKU (aktif hanya saat belum login) ====== */}
      {!isLoggedIn && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden="true"
          title="Silakan login untuk mengakses semua fitur"
          // transparan, cukup menangkap klik
          style={{ background: "transparent" }}
        />
      )}

      <div className="mx-auto max-w-[1400px] p-3 lg:p-6">
        <div className="flex gap-3 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-[190px] lg:w-[210px] shrink-0">
            <div className="sticky top-3">
              {/* Logo */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-400 to-fuchsia-600 grid place-items-center shadow-lg">
                  <span>👑</span>
                </div>
                <div>
                  <div className="text-lg font-semibold tracking-wide">Nafs</div>
                  <div className="text-[11px] text-white/60 -mt-0.5">Premium</div>
                </div>
              </div>

              {/* Access box */}
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

                {/* Tombol LOGIN / KELUAR (selalu bisa diklik) */}
                <div className="mt-2 flex gap-2">
                  {!isLoggedIn ? (
                    <a
                      href={LOGIN_URL}
                      className="relative z-50 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 bg-purple-600/80 hover:bg-purple-600 text-[12px]"
                    >
                      🔐 Login
                    </a>
                  ) : (
                    <a
                      href={LOGOUT_URL}
                      className="relative z-50 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 bg-white/10 hover:bg-white/20 text-[12px]"
                    >
                      🚪 Keluar
                    </a>
                  )}
                </div>
              </div>

              <SectionTitle>Menu</SectionTitle>
              <div className="space-y-1">
                {items.map((it) => (
                  <SideItem
                    key={it.label}
                    icon={it.icon}
                    label={it.label}
                    right={it.right}
                    active={active === it.label}
                    onClick={() => handleClick(it.label)}
                    /* Saat belum login: semua menu dimmed */
                    dimmed={!isLoggedIn}
                  />
                ))}
              </div>

              <SectionTitle>Lainnya</SectionTitle>
              <div className="space-y-1">
                {secondary.map((it) => (
                  <SideItem
                    key={it.label}
                    icon={it.icon}
                    label={it.label}
                    right={it.right}
                    active={active === it.label}
                    onClick={() => handleClick(it.label)}
                    /* Halaman Utama harus tetap bisa diklik => naikkan z-index */
                    elevate={!isLoggedIn && it.label === "Halaman Utama"}
                    dimmed={!isLoggedIn && it.label !== "Halaman Utama"}
                  />
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 rounded-3xl border border-white/10 bg-white/5 min-h-[76vh] flex flex-col overflow-hidden">
            <div className="h-12 border-b border-white/10 px-4 flex items-center justify-between">
              <div className="text-sm text-white/70">
                {active === "Halaman Utama" ? "Web Utama (tanpa login)" : active}
              </div>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span>🌐</span>
                <span>Halaman Khusus Langganan Premium</span>
              </div>
            </div>

            <ContentPlaceholder current={active} />

            <div className="border-t border-white/10 p-3">
              <div className="flex flex-col lg:flex-row items-stretch gap-3">
                <div className="w-full lg:w-72">
                  <ModelSelect value={model} onChange={setModel} disabled={!isLoggedIn} />
                </div>

                <div className="flex-1 grid grid-cols-1">
                  <div
                    className={`rounded-xl border border-white/10 p-3 text-sm ${
                      isLoggedIn ? "bg-white/10 text-white/80" : "bg-white/5 text-white/60"
                    }`}
                  >
                    {isLoggedIn ? "Ketik pesan untuk mulai chat…" : "Silakan login untuk memulai chat."}
                  </div>
                </div>

                {/* Tombol Login/Mulai Chat di footer (selalu boleh diklik) */}
                <div className="w-full lg:w-auto grid place-items-center">
                  {!isLoggedIn ? (
                    <a
                      href={LOGIN_URL}
                      className="relative z-50 inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow-lg"
                    >
                      🔐 Login untuk Menggunakan Chat
                    </a>
                  ) : (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow-lg"
                    >
                      💬 Mulai Chat
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2 text-[11px] text-white/50">
                <span>🪄</span>
                <span>{isLoggedIn ? "Anda sudah login Premium." : "Berlangganan diperlukan untuk akses penuh."}</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

/* Ekspor ke global supaya dipakai App.jsx (Babel CDN) */
window.NafsPremiumApp = NafsPremiumApp;
