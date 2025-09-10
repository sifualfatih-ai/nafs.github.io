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

/* === komponen bantu UI untuk tampilan Generate* === */
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
      className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/30"
    />
  );
}

/* ===== Placeholder default untuk tab lain ===== */
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

/* ===== Tampilan khusus: Generate Image (UI saja) ===== */
function GenerateImageView({ isLoggedIn, model, setModel, loginUrl }) {
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)]">
      {/* panel kiri (form) */}
      <div className="p-4 border-b lg:border-b-0 lg:border-r border-white/10 space-y-3">
        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
          <div className="text-[13px] font-medium mb-3">Generate Image</div>

          <div className="space-y-3">
            <Field label="Gambar Referensi (Opsional)">
              <div className="border border-dashed border-white/15 rounded-lg px-4 py-6 text-center bg-white/[0.02]">
                <div className="text-white/60 text-xl">⬆️</div>
                <div className="text-xs text-white/50 mt-1">Klik untuk unggah</div>
              </div>
            </Field>

            <Field label="Prompt">
              <GhostInput as="textarea" rows={4} placeholder="A cinematic shot of a lone astronaut..." disabled={!isLoggedIn} />
            </Field>

            <Field label="Negative Prompt (Opsional)">
              <GhostInput as="textarea" rows={2} placeholder="e.g., blurry, low quality, text" disabled={!isLoggedIn} />
            </Field>

            <ModelSelect value={model} onChange={setModel} disabled={!isLoggedIn} />

            <Field label="Aspect Ratio">
              <div className="relative">
                <GhostInput placeholder="9:16" disabled={!isLoggedIn} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">▾</span>
              </div>
            </Field>

            <div className="flex gap-2 pt-1">
              {isLoggedIn ? (
                <button
                  onClick={(e)=>e.preventDefault()}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow"
                >
                  Generate
                </button>
              ) : (
                <a
                  href={loginUrl}
                  className="relative z-50 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow"
                >
                  🔐 Login untuk Generate
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* panel kanan (hasil) */}
      <div className="p-4">
        <div className="h-full min-h-[360px] rounded-xl bg-black/40 border border-white/10 overflow-hidden">
          <div className="h-10 px-4 border-b border-white/10 flex items-center text-sm font-medium text-white/90">
            Hasil
          </div>
          <div className="h-[calc(100%-40px)] grid place-items-center text-center p-6">
            <div>
              <div className="text-4xl text-white/50">🖼️</div>
              <p className="mt-2 text-xs text-white/50">Hasil gambar Anda akan muncul di sini.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Tampilan khusus: Generate Video (UI saja) ===== */
function GenerateVideoView({ isLoggedIn, model, setModel, loginUrl }) {
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)]">
      {/* panel kiri (form video) */}
      <div className="p-4 border-b lg:border-b-0 lg:border-r border-white/10 space-y-3">
        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
          <div className="text-[13px] font-medium mb-3">Generate Video</div>

          <div className="space-y-3">
            <Field label="Gambar Referensi (Opsional)">
              <div className="border border-dashed border-white/15 rounded-lg px-4 py-6 text-center bg-white/[0.02]">
                <div className="text-white/60 text-xl">⬆️</div>
                <div className="text-xs text-white/50 mt-1">Klik untuk unggah</div>
              </div>
            </Field>

            <Field label="Model">
              <div className="relative">
                <GhostInput placeholder="VEO 2.0" disabled={!isLoggedIn} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">▾</span>
              </div>
            </Field>

            <Field label="Prompt">
              <GhostInput as="textarea" rows={4} placeholder="A neon hologram of a cat driving..." disabled={!isLoggedIn} />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Aspect Ratio">
                <div className="relative">
                  <GhostInput placeholder="9:16" disabled={!isLoggedIn} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">▾</span>
                </div>
              </Field>
              <Field label="Durasi">
                <div className="relative">
                  <GhostInput placeholder="8 detik" disabled={!isLoggedIn} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">▾</span>
                </div>
              </Field>
            </div>

            <div className="flex gap-2 pt-1">
              {isLoggedIn ? (
                <button
                  onClick={(e)=>e.preventDefault()}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow"
                >
                  Generate Video
                </button>
              ) : (
                <a
                  href={loginUrl}
                  className="relative z-50 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow"
                >
                  🔐 Login untuk Generate
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* panel kanan (hasil video) */}
      <div className="p-4">
        <div className="h-full min-h-[360px] rounded-xl bg-black/40 border border-white/10 overflow-hidden">
          <div className="h-10 px-4 border-b border-white/10 flex items-center text-sm font-medium text-white/90">
            Hasil
          </div>
          <div className="h-[calc(100%-40px)] grid place-items-center text-center p-6">
            <div>
              <div className="text-4xl text-white/50">📹</div>
              <p className="mt-2 text-xs text-white/50">Hasil video Anda akan muncul di sini.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Tampilan khusus: Generate Audio (UI saja) ===== */
function GenerateAudioView({ isLoggedIn, loginUrl }) {
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[520px_minmax(0,1fr)]">
      {/* panel kiri */}
      <div className="p-4 border-b lg:border-b-0 lg:border-r border-white/10 space-y-4">
        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
          <div className="text-[13px] font-medium mb-2">1. Tulis Naskah Anda</div>
          <GhostInput as="textarea" rows={7} placeholder="Ketik atau tempel naskah voice over di sini…" disabled={!isLoggedIn}/>
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
          <div className="text-[13px] font-medium mb-2">2. Pilih Aktor Suara</div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { name: "Wanita A (WaveNet)", desc: "Suara wanita jernih dan ekspresif." },
              { name: "Wanita B (WaveNet)", desc: "Suara dewasa hangat & meyakinkan." },
              { name: "Pria A (WaveNet)", desc: "Suara pria formal & profesional." },
              { name: "Pria B (WaveNet)", desc: "Suara pria berwibawa." },
              { name: "Wanita C (Standard)", desc: "Ringan dan ramah." },
              { name: "Pria C (Standard)", desc: "Natural dan santai." }
            ].map((v,i)=>(
              <button
                key={i}
                disabled={!isLoggedIn}
                className={`text-left rounded-lg border border-white/10 p-3 bg-white/5 hover:bg-white/10 transition ${!isLoggedIn && "opacity-60 cursor-not-allowed"}`}
              >
                <div className="text-sm font-medium">{v.name}</div>
                <div className="text-[11px] text-white/60">{v.desc}</div>
                <div className="mt-2">
                  <span className="inline-block text-[11px] px-2 py-1 rounded bg-white/10 border border-white/10">🔊 Dengar Contoh</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="text-xs text-white/60">Kecepatan Bicara</div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <input type="range" min="50" max="150" defaultValue="100" disabled={!isLoggedIn} className="w-full accent-fuchsia-500"/>
              <span className="text-xs text-white/70">1.00x</span>
            </div>
          </div>

          <div className="mt-3">
            {isLoggedIn ? (
              <button onClick={(e)=>e.preventDefault()} className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">Generate Voice Over</button>
            ) : (
              <a href={loginUrl} className="relative z-50 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">🔐 Silakan login untuk menggunakan fitur ini</a>
            )}
          </div>
        </div>
      </div>

      {/* panel kanan */}
      <div className="p-4">
        <div className="h-full min-h-[360px] rounded-xl bg-black/40 border border-white/10 overflow-hidden">
          <div className="h-10 px-4 border-b border-white/10 flex items-center text-sm font-medium text-white/90">Hasil Voice Over</div>
          <div className="h-[calc(100%-40px)] grid place-items-center text-center p-6">
            <div>
              <div className="text-4xl text-white/50">🎙️</div>
              <p className="mt-2 text-xs text-white/50">Hasil audio Anda akan muncul di sini.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Tampilan khusus: Promosi Produk (UI saja) ===== */
function PromoProdukView({ isLoggedIn, loginUrl }) {
  const vibeOptions = ["Energetic & Fun","Cinematic & Epic","Modern & Clean","Natural & Organic","Tech & Futuristic"];
  const lightOptions = ["Studio Light","Dramatic","Natural Light","Neon"];

  return (
    <div className="flex-1 p-4">
      <div className="mb-3">
        <div className="text-xl font-semibold">Iklan Produk AI</div>
        <div className="text-[12px] text-white/60">Buat storyboard iklan video 6-scene dari satu gambar produk.</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-4">
        {/* kiri */}
        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3 space-y-4">
          <div>
            <div className="text-[13px] font-semibold mb-2">1. Unggah Produk</div>
            <div className="border border-dashed border-white/15 rounded-lg px-4 py-8 text-center bg-white/[0.02]">
              <div className="text-white/60 text-xl">⬆️</div>
              <div className="text-xs text-white/50 mt-1">Klik untuk unggah</div>
            </div>
          </div>

          <div>
            <div className="text-[13px] font-semibold mb-3">2. Arah Kreatif</div>

            <div className="text-[12px] text-white/60 mb-2">Vibe</div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {vibeOptions.map((v) => (
                <button key={v} disabled={!isLoggedIn} className={`rounded-lg px-3 py-2 text-[12px] border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 ${!isLoggedIn && "opacity-60 cursor-not-allowed"}`}>{v}</button>
              ))}
            </div>

            <div className="text-[12px] text-white/60 mb-2">Pencahayaan</div>
            <div className="grid grid-cols-2 gap-2">
              {lightOptions.map((v) => (
                <button key={v} disabled={!isLoggedIn} className={`rounded-lg px-3 py-2 text-[12px] border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 ${!isLoggedIn && "opacity-60 cursor-not-allowed"}`}>{v}</button>
              ))}
            </div>

            <div className="mt-4">
              {isLoggedIn ? (
                <button onClick={(e)=>e.preventDefault()} className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">Generate Konsep Iklan</button>
              ) : (
                <a href={loginUrl} className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">🔐 Login untuk Generate</a>
              )}
            </div>
          </div>
        </div>

        {/* kanan */}
        <div className="rounded-xl bg-white/[0.02] border border-white/10 overflow-hidden">
          <div className="h-10 px-4 border-b border-white/10 flex items-center text-sm font-medium text-white/90">Hasil Storyboard</div>
          <div className="min-h-[420px] grid place-items-center text-center p-6">
            <div>
              <div className="text-4xl text-white/50">🖼️</div>
              <p className="mt-2 text-xs text-white/50">Hasil iklan Anda akan muncul di sini.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Tampilan khusus: Tiktok Affiliate (UI saja) ===== */
function TiktokAffiliateView({ isLoggedIn, loginUrl }) {
  const vibeTags = [
    "Kosan/Asrama","Kafe Aesthetic","Gaya Urban (Apartemen)","Pantai Tropis",
    "Apartemen Mewah","Taman Bunga","Gedung Tua","Perpustakaan Klasik",
    "Studio Minimalis","Rooftop Bar","Taman Musim Gugur","Jalanan Kota",
    "Interior Skandinavia","Hotel Ajaib"
  ];
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)]">
      {/* kiri */}
      <div className="p-4 border-b lg:border-b-0 lg:border-r border-white/10 space-y-4">
        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3 space-y-4">
          <div>
            <div className="text-[13px] font-semibold mb-2">1. Unggah Produk</div>
            <div className="border border-dashed border-white/15 rounded-lg px-4 py-8 text-center bg-white/[0.02]">
              <div className="text-white/60 text-xl">⬆️</div>
              <div className="text-xs text-white/50 mt-1">Klik untuk unggah</div>
            </div>
          </div>

          <div>
            <div className="text-[13px] font-semibold mb-2">2. Pilih Model</div>
            <div className="grid grid-cols-3 gap-2">
              {["Wanita","Pria","Kustom"].map((m)=>(
                <button key={m} disabled={!isLoggedIn} className={`rounded-lg px-3 py-2 text-[12px] border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 ${!isLoggedIn && "opacity-60 cursor-not-allowed"}`}>{m}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[13px] font-semibold mb-2">3. Pilih Vibe Konten</div>
            <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-auto pr-1">
              {vibeTags.map(tag=>(
                <button key={tag} disabled={!isLoggedIn} className={`truncate rounded-lg px-3 py-2 text-[12px] border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 ${!isLoggedIn && "opacity-60 cursor-not-allowed"}`}>{tag}</button>
              ))}
            </div>
          </div>

          <div>
            {isLoggedIn ? (
              <button onClick={(e)=>e.preventDefault()} className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">Generate Gambar</button>
            ) : (
              <a href={loginUrl} className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">🔐 Silakan login untuk membuat konten</a>
            )}
          </div>
        </div>
      </div>

      {/* kanan */}
      <div className="p-4">
        <div className="h-full min-h-[420px] rounded-xl bg-black/40 border border-white/10 overflow-hidden">
          <div className="h-10 px-4 border-b border-white/10 flex items-center text-sm font-medium text-white/90">Hasil</div>
          <div className="h-[calc(100%-40px)] grid place-items-center text-center p-6">
            <div>
              <div className="text-4xl text-white/50">🖼️</div>
              <p className="mt-2 text-xs text-white/50">Hasil konten Anda akan muncul di sini.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Tampilan khusus: Iklan Produk (UI saja) ===== */
function IklanProdukView({ isLoggedIn, loginUrl }) {
  const vibes = [
    "Kontras+","Meja Marmer Mewah",
    "Latar Batu Slate Gelap","Meja Kayu Rustic",
    "Studio Minimalis","Garis Pasir Dramatis",
    "Permukaan Air Tenang","Teras Lumut & Batu",
    "Beton Industrial","Latar Gradien Halus",
    "Bentuk Geometris","Kain Sutra & Satin"
  ];

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)]">
      {/* panel kiri */}
      <div className="p-4 border-b lg:border-b-0 lg:border-r border-white/10">
        <div className="mb-3">
          <div className="text-xl font-semibold">Foto Produk</div>
          <div className="text-[12px] text-white/60">Buat konten UGC untuk produk tanpa model.</div>
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
          {/* Unggah */}
          <div>
            <div className="text-[13px] font-semibold mb-2">1. Unggah Produk</div>
            <div className="border border-dashed border-white/15 rounded-lg px-4 py-8 text-center bg-white/[0.02]">
              <div className="text-white/60 text-xl">⬆️</div>
              <div className="text-xs text-white/50 mt-1">Klik untuk unggah</div>
            </div>
          </div>

          {/* Vibe */}
          <div className="mt-4">
            <div className="text-[13px] font-semibold mb-2">2. Pilih Vibe Konten</div>
            <div className="grid grid-cols-2 gap-2">
              {vibes.map(v => (
                <button
                  key={v}
                  disabled={!isLoggedIn}
                  className={`truncate rounded-lg px-3 py-2 text-[12px] border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 ${!isLoggedIn && "opacity-60 cursor-not-allowed"}`}
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {isLoggedIn ? (
                <button
                  onClick={(e)=>e.preventDefault()}
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow"
                >
                  Generate Gambar
                </button>
              ) : (
                <a
                  href={loginUrl}
                  className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow"
                >
                  🔐 Silakan login untuk membuat konten
                </a>
              )}
              <div className="text-[11px] text-white/50 mt-2">Silakan login untuk membuat konten.</div>
            </div>
          </div>
        </div>
      </div>

      {/* panel kanan */}
      <div className="p-4">
        <div className="h-full min-h-[420px] rounded-xl bg-black/40 border border-white/10 overflow-hidden">
          <div className="h-10 px-4 border-b border-white/10 flex items-center text-sm font-medium text-white/90">Hasil</div>
          <div className="h-[calc(100%-40px)] grid place-items-center text-center p-6">
            <div>
              <div className="text-4xl text-white/50">🖼️</div>
              <p className="mt-2 text-xs text-white/50">Hasil konten Anda akan muncul di sini.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Tampilan khusus: Canvas AI (UI saja) ===== */
function CanvasAIView() {
  // Tampilan mengikuti referensi: area kanvas besar di kanan + panel chat mengambang kiri bawah
  return (
    <div className="relative flex-1 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)] gap-4 h-full">
        {/* Kolom kiri: hanya untuk ruang kosong & panel chat di bawah */}
        <div className="relative">
          {/* Chat mini fixed di kiri bawah (dalam area view) */}
          <div className="absolute left-0 bottom-0">
            <div className="flex items-end gap-3">
              {/* kotak chat */}
              <div className="rounded-2xl bg-white/90 text-black shadow-2xl w-[320px] h-[120px] overflow-hidden">
                <div className="w-full h-full"></div>
              </div>
              {/* bar samping kecil */}
              <div className="h-[120px] w-5 rounded-2xl bg-black/40 shadow" />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[12px] text-white/70">nafsflow canvas AI</span>
              <button className="ml-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] bg-fuchsia-600 shadow">
                🌟 Mulai Chat
              </button>
            </div>
          </div>
        </div>

        {/* Kolom kanan: kanvas utama */}
        <div className="rounded-3xl border border-white/10 bg-white/5 h-[72vh] lg:h-[76vh] overflow-hidden flex flex-col">
          {/* header tab (Kode/Pratinjau) */}
          <div className="p-3">
            <div className="ml-auto w-fit rounded-full bg-[#30184f] px-1 py-1 flex gap-1">
              <button className="px-3 py-1 text-[12px] rounded-full bg-[#4a3168] text-white/80">Kode</button>
              <button className="px-3 py-1 text-[12px] rounded-full bg-white text-black">Pratinjau</button>
            </div>
          </div>
          {/* area pratinjau */}
          <div className="flex-1 bg-white/90 m-3 rounded-2xl grid place-items-center">
            <div className="text-[13px] text-black/70">
              Tampilan kode HTML di kolom ini
            </div>
          </div>
        </div>
      </div>
    </div>
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
    { label: "Generate Audio", icon: "🌊", right: <Badge>Updates</Badge> },
    { label: "Promosi Produk", icon: "📣", right: <Badge>Upadtes</Badge> },
    { label: "Tiktok Affiliate", icon: "🔗", right: <span className="text-[10px] text-white/50">Konten UGC</span> },
    { label: "Iklan Produk", icon: "📷", right: <span className="text-[10px] text-white/50">Konten UGC</span> },
  ];
  const secondary = [
    { label: "Web3 Project", icon: "🎓", right: <span className="text-[10px] text-white/50">e-course</span> },
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

            {/* Tampilkan view sesuai tab */}
            {active === "Canvas AI" ? (
              <CanvasAIView />
            ) : active === "Generate Image" ? (
              <GenerateImageView
                isLoggedIn={isLoggedIn}
                model={model}
                setModel={setModel}
                loginUrl={LOGIN_URL}
              />
            ) : active === "Generate Video" ? (
              <GenerateVideoView
                isLoggedIn={isLoggedIn}
                model={model}
                setModel={setModel}
                loginUrl={LOGIN_URL}
              />
            ) : active === "Generate Audio" ? (
              <GenerateAudioView
                isLoggedIn={isLoggedIn}
                loginUrl={LOGIN_URL}
              />
            ) : active === "Promosi Produk" ? (
              <PromoProdukView
                isLoggedIn={isLoggedIn}
                loginUrl={LOGIN_URL}
              />
            ) : active === "Tiktok Affiliate" ? (
              <TiktokAffiliateView
                isLoggedIn={isLoggedIn}
                loginUrl={LOGIN_URL}
              />
            ) : active === "Iklan Produk" ? (
              <IklanProdukView
                isLoggedIn={isLoggedIn}
                loginUrl={LOGIN_URL}
              />
            ) : (
              <ContentPlaceholder current={active} />
            )}

            {/* Footer chat hanya tampil di halaman Chat */}
            {active === "Chat" && (
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

                  {/* Tombol Login/Mulai Chat di footer */}
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
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* Ekspor ke global supaya dipakai App.jsx (Babel CDN) */
window.NafsPremiumApp = NafsPremiumApp;
