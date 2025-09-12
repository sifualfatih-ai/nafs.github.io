/* global React */
function TiktokAffiliatePage({ isLoggedIn, loginUrl }) {
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

  const [loading, setLoading] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState(null);

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

  async function generate() {
    if(!isLoggedIn) return;
    setLoading(true); setResultUrl(null);
    try {
      const fd = new FormData();
      if (prodFile) fd.append("reference", prodFile);
      const vibeStr = Array.from(selectedVibes).join(", ");
      fd.append("prompt", `Konten UGC TikTok Affiliate, model: ${modelType}, vibe: ${vibeStr}`);
      fd.append("negative", "blurry, low quality, watermark, text");
      fd.append("model", "image-default");
      fd.append("ratio", ratio);
      fd.append("category", "tiktok-affiliate");

      const res = await fetch("/api/generate-image.php", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && data?.imageUrl) {
          setResultUrl(data.imageUrl);
          setLoading(false);
          return;
        }
      }
      setResultUrl(await makeMockImage(modelType, vibeStr, ratio));
    } catch {
      setResultUrl(await makeMockImage(modelType, Array.from(selectedVibes).join(", "), ratio));
    } finally {
      setLoading(false);
    }
  }

  // === mock canvas jika API belum siap ===
  function makeMockImage(model, vibe, ratioStr){
    const [w,h] = ratioStr==="16:9"?[1280,720] : ratioStr==="1:1"?[900,900] : [900,1600]; // 9:16 default
    const c=document.createElement("canvas"); c.width=w; c.height=h;
    const ctx=c.getContext("2d");
    const g=ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,"#0ea5e9"); g.addColorStop(1,"#a21caf");
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.fillStyle="rgba(255,255,255,0.95)"; ctx.font=`${Math.max(28, Math.floor(w/24))}px sans-serif`;
    ctx.fillText("TikTok Affiliate (Mock)", 40, 80);
    ctx.font=`${Math.max(18, Math.floor(w/36))}px sans-serif`;
    ctx.fillText(`Model: ${model}`, 40, 130);
    wrap(ctx, `Vibe: ${vibe||"-"}`, 40, 180, w-80, Math.max(22, Math.floor(w/40)));
    ctx.font=`${Math.max(16, Math.floor(w/46))}px monospace`;
    ctx.fillText(`ratio ${ratioStr}`, 40, h-40);
    return Promise.resolve(c.toDataURL("image/png"));
  }
  function wrap(ctx, text, x, y, maxWidth, lineHeight){
    const words=text.split(" "); let line="", yy=y;
    for(let n=0;n<words.length;n++){
      const test=line+words[n]+" "; const w=ctx.measureText(test).width;
      if (w>maxWidth && n>0){ ctx.fillText(line, x, yy); line=words[n]+" "; yy+=lineHeight; }
      else { line=test; }
    }
    ctx.fillText(line, x, yy);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)]">
      {/* panel kiri */}
      <div className="p-4 border-b lg:border-b-0 lg:border-r border-white/10 space-y-4">
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

          <div>
            <div className="text-[13px] font-semibold mb-2">3. Pilih Vibe Konten</div>
            <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-auto pr-1">
              {vibeTags.map(tag=>(
                <button key={tag}
                  onClick={()=>toggleVibe(tag)}
                  disabled={!isLoggedIn}
                  className={`truncate rounded-lg px-3 py-2 text-[12px] border border-white/10 bg-white/5 hover:bg-white/10 text-white/80
                    ${!isLoggedIn?"opacity-60 cursor-not-allowed":""} ${selectedVibes.has(tag)?"ring-1 ring-fuchsia-400":""}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[13px] font-semibold mb-2">4. Aspect Ratio</div>
            <select value={ratio} onChange={e=>setRatio(e.target.value)} disabled={!isLoggedIn}
              className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90 focus:outline-none">
              {["9:16","16:9","1:1"].map(r=><option key={r} className="bg-[#1a0b2e]" value={r}>{r}</option>)}
            </select>
          </div>

          <div>
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

window.NafsPages.TiktokAffiliate = TiktokAffiliatePage;
