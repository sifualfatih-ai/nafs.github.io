export default function TiktokAffiliateView({ isLoggedIn, loginUrl }) {
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
