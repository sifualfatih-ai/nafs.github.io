import { GhostInput } from "../components/Common.jsx";

export default function GenerateAudioView({ isLoggedIn, loginUrl }) {
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
