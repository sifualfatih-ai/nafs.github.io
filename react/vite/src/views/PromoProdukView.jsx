export default function PromoProdukView({ isLoggedIn, loginUrl }) {
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
