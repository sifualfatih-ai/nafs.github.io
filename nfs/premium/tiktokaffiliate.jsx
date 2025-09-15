/* global React */
(function () {

  function TiktokAffiliate({ isLoggedIn, loginUrl }) {
    const vibeTags = [
      "Kosan/Asrama","Kafe Aesthetic","Gaya Urban (Apartemen)","Pantai Tropis",
      "Apartemen Mewah","Taman Bunga","Gedung Tua","Perpustakaan Klasik",
      "Studio Minimalis","Rooftop Bar","Taman Musim Gugur","Jalanan Kota",
      "Interior Skandinavia","Hotel Ajaib"
    ];

    const [modelType, setModelType] = React.useState("Wanita");
    const [selectedVibes, setSelectedVibes] = React.useState(new Set([vibeTags[0]]));
    const [ratio, setRatio] = React.useState("9:16");

    const [prodFile, setProdFile] = React.useState(null);
    const [prodPreview, setProdPreview] = React.useState(null);

    const [cards, setCards] = React.useState(
      Array.from({ length: 6 }, () => ({ posterUrl: null, videoUrl: null, loading: false }))
    );
    const [generatingGrid, setGeneratingGrid] = React.useState(false);

    const fileInputRef = React.useRef(null);
    function onPickFile(){ if(!isLoggedIn) return; fileInputRef.current?.click(); }
    function onFileChange(e){
      const f = e.target.files?.[0]; if(!f) return;
      setProdFile(f); setProdPreview(URL.createObjectURL(f));
    }

    function toggleVibe(tag){
      if(!isLoggedIn) return;
      setSelectedVibes(prev=>{
        const next = new Set(prev);
        if(next.has(tag)) next.delete(tag); else next.add(tag);
        return next;
      });
    }

    // buat 6 poster dummy
    async function generateGrid() {
      if(!isLoggedIn) return;
      setGeneratingGrid(true);
      const vibeStr = Array.from(selectedVibes).join(", ");
      const posters = await Promise.all(
        Array.from({ length: 6 }).map((_, i) =>
          makeMockPoster(`Gambar ${i+1}`, modelType, vibeStr, ratio)
        )
      );
      setCards(posters.map(p => ({ posterUrl: p, videoUrl: null, loading: false })));
      setGeneratingGrid(false);
    }

    async function handleGenerateVideo(idx){
      if(!isLoggedIn) return;
      setCards(prev => prev.map((c,i) => i===idx ? ({...c, loading:true}) : c));

      try {
        const fd = new FormData();
        if (prodFile) fd.append("reference", prodFile);
        const vibeStr = Array.from(selectedVibes).join(", ");
        fd.append("prompt", `Konten UGC TikTok Affiliate, model: ${modelType}, vibe: ${vibeStr}, frame ${idx+1}`);
        fd.append("model", "VEO 2.0");
        fd.append("ratio", ratio);
        fd.append("duration", "8");
        fd.append("category", "tiktok-affiliate");

        const res = await fetch("/api/generate-video.php", { method: "POST", body: fd });
        if (res.ok) {
          const data = await res.json();
          if (data?.ok && (data?.videoUrl || data?.posterUrl)) {
            setCards(prev => prev.map((c,i) =>
              i===idx ? ({
                posterUrl: data.posterUrl || c.posterUrl,
                videoUrl: data.videoUrl || null,
                loading:false
              }) : c
            ));
            return;
          }
        }
        setCards(prev => prev.map((c,i) => i===idx ? ({...c, loading:false}) : c));
      } catch {
        setCards(prev => prev.map((c,i) => i===idx ? ({...c, loading:false}) : c));
      }
    }

    function makeMockPoster(title, model, vibe, ratioStr){
      const [w,h] = [900,1600];
      const c=document.createElement("canvas"); c.width=w; c.height=h;
      const ctx=c.getContext("2d");
      const g=ctx.createLinearGradient(0,0,w,h);
      g.addColorStop(0,"#2a0f4a"); g.addColorStop(1,"#1a0b2e");
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      ctx.fillStyle="#37415188"; ctx.fillRect(32,32,w-64,h-164);
      ctx.fillStyle="rgba(255,255,255,0.85)";
      ctx.font="24px Sans-Serif"; ctx.textAlign="center";
      ctx.fillText(title, w/2, h-120);
      ctx.fillStyle="rgba(255,255,255,0.6)";
      ctx.font="16px Sans-Serif";
      ctx.fillText(`Model: ${model}`, w/2, h-90);
      ctx.fillText(`Rasio ${ratioStr}`, w/2, h-66);
      return Promise.resolve(c.toDataURL("image/png"));
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* kiri */}
        <div className="p-4 border-b lg:border-b-0 lg:border-r border-white/10 space-y-4">
          <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3 space-y-4">

            {/* unggah produk */}
            <div>
              <div className="text-[13px] font-semibold mb-2">1. Unggah Produk</div>
              <div onClick={onPickFile}
                   className={`border border-dashed border-white/15 rounded-lg px-4 py-8 text-center bg-white/[0.02] ${!isLoggedIn?"opacity-60 cursor-not-allowed":"cursor-pointer"}`}>
                {prodPreview ? (
                  <img src={prodPreview} alt="produk" className="mx-auto max-h-48 rounded-lg object-contain" />
                ) : (
                  <>
                    <div className="text-white/60 text-xl">⬆️</div>
                    <div className="text-xs text-white/50 mt-1">Klik untuk unggah</div>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden"/>
            </div>

            {/* pilih model */}
            <div>
              <div className="text-[13px] font-semibold mb-2">2. Pilih Model</div>
              <div className="grid grid-cols-3 gap-2">
                {["Wanita","Pria","Kustom"].map((m)=>( 
                  <button key={m}
                    onClick={()=>isLoggedIn && setModelType(m)}
                    disabled={!isLoggedIn}
                    className={`rounded-lg px-3 py-2 text-[12px] border border-white/10 bg-white/5 hover:bg-white/10 text-white/80
                      ${!isLoggedIn?"opacity-60 cursor-not-allowed":""} ${modelType===m?"ring-1 ring-fuchsia-400":""}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* vibes */}
            <div>
              <div className="text-[13px] font-semibold mb-2">3. Pilih Vibe Konten</div>
              <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-auto pr-1">
                {vibeTags.map(tag=>(
                  <button key={tag}
                    onClick={()=>toggleVibe(tag)} disabled={!isLoggedIn}
                    className={`truncate rounded-lg px-3 py-2 text-[12px] border border-white/10 bg-white/5 hover:bg-white/10 text-white/80
                      ${!isLoggedIn?"opacity-60 cursor-not-allowed":""} ${selectedVibes.has(tag)?"ring-1 ring-fuchsia-400":""}`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* ratio */}
            <div>
              <div className="text-[13px] font-semibold mb-2">4. Aspect Ratio</div>
              <select value={ratio} onChange={e=>setRatio(e.target.value)} disabled={!isLoggedIn}
                className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90 focus:outline-none">
                {["9:16","16:9","1:1"].map(r=><option key={r} className="bg-[#1a0b2e]" value={r}>{r}</option>)}
              </select>
            </div>

            {/* tombol generate grid */}
            <div>
              {isLoggedIn ? (
                <button onClick={generateGrid}
                        disabled={generatingGrid}
                        className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">
                  {generatingGrid ? "Menyiapkan Frame..." : "Generate 6 Frame"}
                </button>
              ) : (
                <a href={loginUrl} className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">
                  🔐 Silakan login untuk membuat konten
                </a>
              )}
            </div>

          </div>
        </div>

        {/* kanan: GRID */}
        <div className="p-4">
          <div className="h-full min-h-[420px] rounded-xl bg-white/[0.02] border border-white/10">
            <div className="h-10 px-4 border-b border-white/10 flex items-center text-sm font-medium text-white/90">Hasil</div>

            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cards.map((card, idx)=>(
                <div key={idx} className="rounded-2xl bg-[#2a0f4a]/40 border border-white/10 overflow-hidden flex flex-col">
                  <div style={{ aspectRatio: "9 / 16" }}
                       className="bg-[#374151] grid place-items-center relative">
                    {card.videoUrl ? (
                      <video src={card.videoUrl} poster={card.posterUrl || undefined} controls className="absolute inset-0 w-full h-full object-cover"/>
                    ) : card.posterUrl ? (
                      <img src={card.posterUrl} alt={`poster ${idx+1}`} className="absolute inset-0 w-full h-full object-cover"/>
                    ) : (
                      <span className="text-white/50 text-sm">Frame {idx+1}</span>
                    )}
                  </div>
                  <div className="p-2 border-t border-white/10">
                    {isLoggedIn ? (
                      <button
                        onClick={()=>handleGenerateVideo(idx)}
                        disabled={card.loading}
                        className="w-full rounded-lg px-3 py-2 text-sm bg-gradient-to-r from-purple-500 to-fuchsia-600 shadow">
                        {card.loading ? "Rendering..." : "Generate Video"}
                      </button>
                    ) : (
                      <a href={loginUrl} className="w-full inline-flex items-center justify-center px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm shadow">
                        🔐 Login untuk Generate
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!cards.some(c=>c.posterUrl||c.videoUrl) && !generatingGrid && (
              <div className="grid place-items-center text-center min-h-[240px] text-white/50 text-xs">
                Hasil konten Anda akan muncul di sini.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  window.NafsPages = window.NafsPages || {};
  window.NafsPages.TiktokAffiliate = TiktokAffiliate;

})();
