/* ---- KONFIG URL ABSOLUT GITHUB PAGES ---- */
const BASE = "https://nafsflow.com/";
const HERE = "https://nafsflow.com/react/vite/";

const HOMEPAGE_URL = BASE;
const LOGIN_URL  = BASE + `?login=1&r=${encodeURIComponent(HERE)}`;
const LOGOUT_URL = BASE + `?logout=1&r=${encodeURIComponent(HERE)}`;

/* ==== TOKEN WARNA (HANYA UI) ==== */
const surface = "bg-[#0C0516]";      // latar dasar ungu tua
const panel   = "bg-[#130825]";      // panel/kartu
const stroke  = "border-white/10";
const primGrad = "from-[#8B5CF6] to-[#D946EF]"; // gradient ungu→fuchsia
const primText = "text-[#C084FC]";   // teks aksen ungu
const primSolid = "bg-[#8B5CF6]";    // solid ungu

/* ==== UI KOMPONEN ==== */
function Badge({ children }) {
  return (
    <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-200">
      {children}
    </span>
  );
}

function SideItem({ icon, label, right, active, onClick, elevate = false, dimmed = false }) {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all
        ${active ? "bg-white/5 ring-1 ring-fuchsia-400/20 shadow-[0_0_0_1px_rgba(0,0,0,0.4)]" : "hover:bg-white/5"}
        ${elevate ? "relative z-50" : ""} ${dimmed ? "opacity-60" : ""}`}
    >
      <span className="h-4 w-4">
        <span className="inline-block align-middle">{icon}</span>
      </span>
      <span className={`text-[13px] ${active ? "text-white" : "text-white/85"}`}>{label}</span>
      <span className="ml-auto">{right}</span>
      {active && <span className="ml-2 h-1.5 w-1.5 rounded-full bg-fuchsia-400/70" />}
    </button>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/40 px-2 mt-6 mb-2">
      <span>{children}</span>
      <span className="text-white/40">▾</span>
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-white/60">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-white/40">{hint}</p>}
    </div>
  );
}

function GhostInput({ as = "input", ...rest }) {
  const C = as;
  return (
    <C
      {...rest}
      className={`w-full rounded-lg ${panel} border ${stroke} px-3 py-2 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30`}
    />
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
          className={`w-full appearance-none rounded-lg ${panel} border ${stroke} px-3 py-2 pr-9 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30
            ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {models.map((m) => (
            <option key={m} className="bg-[#0C0516]" value={m}>
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
    <div className="flex-1 grid place-items-center p-6">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-3 h-11 w-11 rounded-full grid place-items-center bg-white/[0.03] border border-white/10">
          <span className="text-white/60">🖼️</span>
        </div>
        <p className="text-white/80 text-sm">Hasil {current} akan tampil di sini.</p>
        <p className="mt-1 text-xs text-white/40">Mulai dengan mengisi form atau mengetik prompt di panel kiri.</p>
      </div>
    </div>
  );
}

function ToolbarChip({ children }) {
  return (
    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-white/70">
      {children}
    </span>
  );
}

/* ===================== APP ===================== */
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
    { label: "Generate Audio", icon: "🌊" },
    { label: "Promosi Produk", icon: "📣" },
    { label: "Tiktok Affiliate", icon: "🔗", right: <span className="text-[9px] text-white/50">Konten UGC</span> },
    { label: "Iklan Produk", icon: "📷", right: <span className="text-[9px] text-white/50">Konten UGC</span> },
  ];
  const secondary = [
    { label: "Tutorial", icon: "🎓" },
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
    <div className={`min-h-screen w-full ${surface} text-white`}>
      {/* overlay pembeku (tidak mengubah logika akses) */}
      {!isLoggedIn && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden="true"
          title="Silakan login untuk mengakses semua fitur"
          style={{ background: "transparent" }}
        />
      )}

      <div className="mx-auto max-w-[1400px] p-3 lg:p-6">
        <div className="flex gap-3 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-[208px] shrink-0">
            <div className="sticky top-3">
              {/* Logo */}
              <div className="flex items-center gap-2 mb-5">
                <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${primGrad} grid place-items-center shadow-lg`}>
                  <span className="text-black/80">☆</span>
                </div>
                <div>
                  <div className="text-lg font-semibold tracking-wide">Nafs</div>
                  <div className="text-[11px] text-white/60 -mt-0.5">Premium</div>
                </div>
              </div>

              {/* Access box */}
              <div className={`rounded-2xl ${panel} border ${stroke} p-3.5 mb-3`}>
                <div className="flex items-center gap-2 text-sm">
                  <span className={primText}>✨</span>
                  <span className="font-medium">
                    {isLoggedIn ? "Premium Aktif" : "Akses Premium"}
                  </span>
                </div>
                <p className="text-[11px] text-white/60 mt-2 leading-relaxed">
                  {isLoggedIn
                    ? "Langganan aktif. Nikmati semua fitur premium."
                    : <>Ini adalah laman premium. Silakan <b className="text-white">login & berlangganan</b> untuk mengakses seluruh fitur.</>}
                </p>

                <div className="mt-2 flex gap-2">
                  {!isLoggedIn ? (
                    <a
                      href={LOGIN_URL}
                      className={`relative z-50 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 bg-gradient-to-r ${primGrad} text-black text-[12px] font-medium`}
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
                    elevate={!isLoggedIn && it.label === "Halaman Utama"}
                    dimmed={!isLoggedIn && it.label !== "Halaman Utama"}
                  />
                ))}
              </div>

              <div className="mt-6 text-[10px] text-white/35 px-2">© 2025 Nafs Premium</div>
            </div>
          </aside>

          {/* Main */}
          <main className={`flex-1 rounded-2xl ${panel} border ${stroke} min-h-[76vh] flex flex-col overflow-hidden`}>
            {/* Header */}
            <div className="h-14 border-b border-white/10 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-medium">
                  {active === "Halaman Utama" ? "Web Utama (tanpa login)" : active}
                </h2>
                <span className="text-white/30">•</span>
                <ToolbarChip>Premium Area</ToolbarChip>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className={primText}>●</span>
                <span>Halaman Khusus Langganan Premium</span>
              </div>
            </div>

            {/* Body: kiri form, kanan hasil */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] gap-0">
              {/* Panel kiri */}
              <div className="p-4 border-b lg:border-b-0 lg:border-r border-white/10 space-y-3">
                <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
                  <div className="text-[13px] font-medium mb-3">Panel Kontrol</div>

                  <div className="space-y-3">
                    <Field label="Gambar Referensi (Opsional)">
                      <div className="border border-dashed border-white/15 rounded-lg px-4 py-6 text-center bg-white/[0.02]">
                        <div className="text-white/60 text-xl">⬆️</div>
                        <div className="text-xs text-white/50 mt-1">Klik untuk unggah</div>
                      </div>
                    </Field>

                    <Field label="Prompt">
                      <GhostInput as="textarea" rows={4} placeholder="Tulis prompt di sini..." disabled={!isLoggedIn} />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Negative Prompt (Opsional)">
                        <GhostInput as="textarea" rows={2} placeholder="e.g., blurry, low quality, text" disabled={!isLoggedIn} />
                      </Field>
                      <ModelSelect value={model} onChange={setModel} disabled={!isLoggedIn} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Aspect Ratio">
                        <GhostInput placeholder="9:16" disabled={!isLoggedIn} />
                      </Field>
                      <Field label="Durasi (untuk video)">
                        <GhostInput placeholder="8 detik" disabled={!isLoggedIn} />
                      </Field>
                    </div>

                    <div className="flex gap-2 pt-1">
                      {isLoggedIn ? (
                        <button
                          className={`inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r ${primGrad} text-black text-sm font-medium shadow`}
                          onClick={(e) => e.preventDefault()}
                        >
                          Generate
                        </button>
                      ) : (
                        <a
                          href={LOGIN_URL}
                          className={`relative z-50 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r ${primGrad} text-black text-sm font-medium shadow`}
                        >
                          🔐 Login untuk Generate
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel kanan (hasil) */}
              <div className="flex min-h-[380px]">
                <ContentPlaceholder current={active} />
              </div>
            </div>

            {/* Footer chat */}
            <div className="border-t border-white/10 p-3">
              <div className="flex flex-col lg:flex-row items-stretch gap-3">
                <div className="w-full lg:w-72">
                  <ModelSelect value={model} onChange={setModel} disabled={!isLoggedIn} />
                </div>

                <div className="flex-1 grid grid-cols-1">
                  <div
                    className={`rounded-lg border ${stroke} p-3 text-sm ${isLoggedIn ? "bg-white/5 text-white/85" : "bg-white/[0.02] text-white/60"}`}
                  >
                    {isLoggedIn ? "Ketik pesan untuk mulai chat…" : "Silakan login untuk memulai chat."}
                  </div>
                </div>

                <div className="w-full lg:w-auto grid place-items-center">
                  {!isLoggedIn ? (
                    <a
                      href={LOGIN_URL}
                      className={`relative z-50 inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-gradient-to-r ${primGrad} text-black text-sm font-medium shadow`}
                    >
                      🔐 Login untuk Menggunakan Chat
                    </a>
                  ) : (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 ${primSolid} text-white text-sm font-medium shadow`}
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
