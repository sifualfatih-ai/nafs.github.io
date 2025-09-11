export default function CanvasAIView() {
  return (
    <div className="relative flex-1 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-[420px_minmax(0,1fr)] gap-4 h-full">
        <div className="relative">
          <div className="absolute left-0 bottom-0">
            <div className="flex items-end gap-3">
              <div className="rounded-2xl bg-white/90 text-black shadow-2xl w-[320px] h-[120px] overflow-hidden">
                <div className="w-full h-full"></div>
              </div>
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

        <div className="rounded-3xl border border-white/10 bg-white/5 h-[72vh] lg:h-[76vh] overflow-hidden flex flex-col">
          <div className="p-3">
            <div className="ml-auto w-fit rounded-full bg-[#30184f] px-1 py-1 flex gap-1">
              <button className="px-3 py-1 text-[12px] rounded-full bg-[#4a3168] text-white/80">Kode</button>
              <button className="px-3 py-1 text-[12px] rounded-full bg-white text-black">Pratinjau</button>
            </div>
          </div>
          <div className="flex-1 bg-white/90 m-3 rounded-2xl grid place-items-center">
            <div className="text-[13px] text-black/70">Tampilan kode HTML di kolom ini</div>
          </div>
        </div>
      </div>
    </div>
  );
}
