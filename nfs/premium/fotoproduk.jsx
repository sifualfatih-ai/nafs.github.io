/* global React */
function FotoProdukPage({ isLoggedIn, loginUrl }) {
  const vibes = [
    "Kontras+","Meja Marmer Mewah","Latar Batu Slate Gelap","Meja Kayu Rustic",
    "Studio Minimalis","Garis Pasir Dramatis","Permukaan Air Tenang","Teras Lumut & Batu",
    "Beton Industrial","Latar Gradien Halus","Bentuk Geometris","Kain Sutra & Satin"
  ];

  const [selectedVibe, setSelectedVibe] = React.useState(vibes[0]);
  const [ratio, setRatio] = React.useState("4:5");

  const [prodFile, setProdFile] = React.useState(null);
  const [prodPreview, setProdPreview] = React.useState(null);

  const [loading, setLoading] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState(null);

  const fileInputRef = React.useRef(null);
  function onPickFile(){ if(!isLoggedIn) return; fileInputRef.current?.click(); }
  function onFileChange(e){
    const f = e.target.files?.[0]; if(!f) return;
    setProdFile(f); setProdPreview(URL.createObjectURL(f));
  }

  async function generate() {
    if(!isLoggedIn) return;
    setLoading(true); setResultUrl(null);
    try {
      const fd = new FormData();
      if (prodFile) fd.append("reference", prodFile);
      fd.append("prompt", `Foto produk UGC, vibe: ${selectedVibe}`);
      fd.append("negative", "blurry, low quality, watermark, text");
      fd.append("model", "image-default");
      fd.append("ratio", ratio);
      fd.append("category", "fotoproduk");

      const res = await fetch("/api/generate-image.php", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && data?.imageUrl) {
          setResultUrl(data.imageUrl);
          setLoading(false);
          return;
        }
      }
      setResultUrl(await makeMockImage(selectedVibe, ratio));
    } catch {
      setResultUrl(await makeMockImage(selectedVibe, ratio));
    } finally {
      setLoading(false);
    }
  }

  // === mock canvas jika API belum siap ===
  function makeMockImage(vibe, ratioStr){
    const [w,h] = ratioStr==="1:1"?[900,900] : ratioStr==="16:9"?[1280,720] : [900,1125]; // 4:5 default
    const c=document.createElement("canvas"); c.width=w; c.height=h;
    const ctx=c.getContext("2d");
    const g=ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,"#3b0764"); g.addColorStop(1,"#0e7490");
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.fillStyle="rgba(255,255,255,0.92)"; ctx.font=`${Math.max(28, Math.floor(w/24))}px sans-serif`;
    ctx.fillText("Foto Produk (Mock)", 40, 80);
    ctx.font=`${Math.max(18, Math.floor(w/36))}px sans-serif`;
    ctx.fillText(`Vibe: ${vibe}`, 40, 130);
    ctx.font=`${Math.max(16, Math.floor(w/46))}px monospace`;
    ctx.fillText(`ratio ${ratioStr}`, 40, h-40);
    return Promise.resolve(c.toDataURL("image/png"));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)]">
      {/* panel kiri */}
      <div className="p-4 border-b lg:border-b-0 lg:border-r border-white/10">
        <div className="mb-3">
          <div className="text-xl font-semibold">Foto Produk</div>
          <div className="text-[12px] text-white/60">Buat konten UGC untuk produk tanpa model.</div>
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3 space-y-4">
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

          <div>
            <div className="text-[13px] font-semibold mb-2">2. Pilih Vibe Konten</div>
            <div className="grid grid-cols-2 gap-2">
              {vibes.map(v=>(
                <button key={v}
                  onClick={()=>isLoggedIn && setSelectedVibe(v)}
                  disabled={!isLoggedIn}
                  className={`truncate rounded-lg px-3 py-2 text-[12px] border border-white/10 bg-white/5 hover:bg-white/10 text-white/80
                    ${!isLoggedIn?"opacity-60 cursor-not-allowed":""} ${selectedVibe===v?"ring-1 ring-fuchsia-400":""}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[13px] font-semibold mb-2">3. Aspect Ratio</div>
            <select value={ratio} onChange={e=>setRatio(e.target.value)} disabled={!isLoggedIn}
              className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90 focus:outline-none">
              {["4:5","1:1","16:9"].map(r=><option key={r} className="bg-[#1a0b2e]" value={r}>{r}</option>)}
            </select>
          </div>

          <div className="mt-1">
            {isLoggedIn ? (
              <button onClick={(e)=>{e.preventDefault(); generate();}}
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">
                {loading ? "Generating..." : "Generate Gambar"}
              </button>
            ) : (
              <a href={loginUrl} className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">
                🔐 Silakan login untuk membuat konten
              </a>
            )}
            <div className="text-[11px] text-white/50 mt-2">Server akan membaca API key dari .env</div>
          </div>
        </div>
      </div>

      {/* panel kanan */}
      <div className="p-4">
        <div className="h-full min-h-[420px] rounded-xl bg-black/40 border border-white/10 overflow-hidden">
          <div className="h-10 px-4 border-b border-white/10 flex items-center text-sm font-medium text-white/90">Hasil</div>
          <div className="h-[calc(100%-40px)] grid place-items-center text-center p-6">
            {!resultUrl ? (
              <div>
                <div className="text-4xl text-white/50">{loading?"⏳":"🖼️"}</div>
                <p className="mt-2 text-xs text-white/50">{loading?"Sedang membuat gambar...":"Hasil konten Anda akan muncul di sini."}</p>
              </div>
            ) : (
              <img src={resultUrl} alt="hasil" className="max-h-[60vh] rounded-xl object-contain"/>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.NafsPages.FotoProduk = FotoProdukPage;
