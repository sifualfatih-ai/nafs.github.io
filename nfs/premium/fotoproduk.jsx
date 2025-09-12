/* global React */
function FotoProdukPage({ isLoggedIn, loginUrl }) {
  const vibes = [
    "Kontras+","Meja Marmer Mewah","Latar Batu Slate Gelap","Meja Kayu Rustic",
    "Studio Minimalis","Garis Pasir Dramatis","Permukaan Air Tenang","Teras Lumut & Batu",
    "Beton Industrial","Latar Gradien Halus","Bentuk Geometris","Kain Sutra & Satin"
  ];

  const [selectedVibe, setSelectedVibe] = React.useState(vibes[0]);

  // upload produk sumber (opsional)
  const [prodFile, setProdFile] = React.useState(null);
  const [prodPreview, setProdPreview] = React.useState(null);
  const fileInputRef = React.useRef(null);
  function onPickFile(){ if(!isLoggedIn) return; fileInputRef.current?.click(); }
  function onFileChange(e){
    const f = e.target.files?.[0]; if(!f) return;
    setProdFile(f); setProdPreview(URL.createObjectURL(f));
  }

  // grid 6 frame
  // imageUrl = hasil akhir; posterUrl = mock/placeholder; videoUrl = hasil video; loadingImg / loadingVid: status
  const [cards, setCards] = React.useState(
    Array.from({ length: 6 }, () => ({ imageUrl: null, posterUrl: null, videoUrl: null, loadingImg: false, loadingVid: false }))
  );
  const [preparing, setPreparing] = React.useState(false);

  // siapkan 6 poster mock (9:16)
  async function prepareSixFrames(){
    if(!isLoggedIn) return;
    setPreparing(true);
    const posters = await Promise.all(
      Array.from({ length: 6 }).map((_, i)=> makeMockPoster(`Gambar ${i+1}`, selectedVibe))
    );
    setCards(posters.map(p => ({ imageUrl: null, posterUrl: p, videoUrl: null, loadingImg: false, loadingVid: false })));
    setPreparing(false);
  }

  // generate gambar per-kartu
  async function handleGenerateImage(idx){
    if(!isLoggedIn) return;
    setCards(prev => prev.map((c,i)=> i===idx ? ({...c, loadingImg:true}) : c));

    try {
      const fd = new FormData();
      if (prodFile) fd.append("reference", prodFile);
      fd.append("prompt", `Foto produk UGC vertikal (9:16), vibe: ${selectedVibe}, frame ${idx+1}`);
      fd.append("negative", "blurry, low quality, watermark, text");
      fd.append("model", "image-default");
      fd.append("ratio", "9:16");
      fd.append("category", "fotoproduk");

      const res = await fetch("/api/generate-image.php", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && data?.imageUrl) {
          setCards(prev => prev.map((c,i)=>
            i===idx ? ({ ...c, imageUrl: data.imageUrl, posterUrl: data.imageUrl, loadingImg:false }) : c
          ));
          return;
        }
      }
      setCards(prev => prev.map((c,i)=> i===idx ? ({...c, loadingImg:false}) : c));
    } catch {
      setCards(prev => prev.map((c,i)=> i===idx ? ({...c, loadingImg:false}) : c));
    }
  }

  // download gambar (imageUrl jika ada; kalau belum, pakai posterUrl)
  async function handleDownload(idx){
    const card = cards[idx];
    const url = card.imageUrl || card.posterUrl;
    if (!url) return;
    try {
      // unduh sebagai blob agar aman lintas domain
      const resp = await fetch(url, { mode: "cors" }).catch(()=>null);
      if (resp && resp.ok) {
        const blob = await resp.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `foto-produk-${idx+1}.${(blob.type||"image/png").includes("jpeg")?"jpg":"png"}`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
      } else {
        // fallback: langsung open (biar bisa save-as)
        window.open(url, "_blank");
      }
    } catch {
      window.open(url, "_blank");
    }
  }

  // generate VIDEO dari image pada kartu
  async function handleGenerateVideoFromImage(idx){
    if(!isLoggedIn) return;
    const card = cards[idx];
    const url = card.imageUrl || card.posterUrl;
    if (!url) return;

    setCards(prev => prev.map((c,i)=> i===idx ? ({...c, loadingVid:true}) : c));

    try {
      const fd = new FormData();
      // coba kirim sebagai file (blob); kalau CORS blok, kirim referenceUrl
      let blobSent = false;
      try {
        const r = await fetch(url, { mode: "cors" });
        if (r.ok) {
          const b = await r.blob();
          const fname = `frame-${idx+1}.${(b.type||"image/png").includes("jpeg")?"jpg":"png"}`;
          fd.append("reference", new File([b], fname, { type: b.type || "image/png" }));
          blobSent = true;
        }
      } catch {/* noop */}

      if (!blobSent) fd.append("referenceUrl", url);

      fd.append("prompt", `Video produk vertikal 9:16 dari frame ${idx+1} (vibe: ${selectedVibe})`);
      fd.append("model", "VEO 2.0");
      fd.append("ratio", "9:16");
      fd.append("duration", "8");
      fd.append("category", "fotoproduk-video");

      const res = await fetch("/api/generate-video.php", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && (data?.videoUrl || data?.posterUrl)) {
          setCards(prev => prev.map((c,i)=>
            i===idx ? ({ ...c, videoUrl: data.videoUrl || null, posterUrl: data.posterUrl || c.posterUrl, loadingVid:false }) : c
          ));
          return;
        }
      }
      setCards(prev => prev.map((c,i)=> i===idx ? ({...c, loadingVid:false}) : c));
    } catch {
      setCards(prev => prev.map((c,i)=> i===idx ? ({...c, loadingVid:false}) : c));
    }
  }

  // mock poster (tema ungu, 9:16)
  function makeMockPoster(title, vibe){
    const [w,h] = [900,1600];
    const c = document.createElement("canvas"); c.width=w; c.height=h;
    const ctx = c.getContext("2d");
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,"#2a0f4a"); g.addColorStop(1,"#1a0b2e");
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = "#37415188"; ctx.fillRect(28,28,w-56,h-156);
    ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.font = "22px Sans-Serif"; ctx.textAlign="center";
    ctx.fillText(title, w/2, h-112);
    ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.font = "16px Sans-Serif";
    ctx.fillText(`Vibe: ${vibe}`, w/2, h-84);
    ctx.fillText("Rasio 9:16", w/2, h-62);
    return Promise.resolve(c.toDataURL("image/png"));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)]">
      {/* panel kiri */}
      <div className="p-4 border-b lg:border-b-0 lg:border-r border-white/10">
        <div className="mb-3">
          <div className="text-xl font-semibold">Foto Produk</div>
          <div className="text-[12px] text-white/60">Buat 6 variasi gambar UGC vertikal (9:16), lalu unduh atau teruskan ke video.</div>
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3 space-y-4">
          {/* 1. upload */}
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

          {/* 2. vibe */}
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

          {/* 3. siapkan 6 frame */}
          <div className="mt-1">
            {isLoggedIn ? (
              <button onClick={(e)=>{e.preventDefault(); prepareSixFrames();}}
                      disabled={preparing}
                      className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">
                {preparing ? "Menyiapkan Frame..." : "Generate 6 Frame"}
              </button>
            ) : (
              <a href={loginUrl} className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">
                🔐 Silakan login untuk membuat konten
              </a>
            )}
            <div className="text-[11px] text-white/50 mt-2">Server membaca API key dari .env</div>
          </div>
        </div>
      </div>

      {/* panel kanan: GRID 6 IMAGE 9:16 */}
      <div className="p-4">
        <div className="h-full min-h-[420px] rounded-xl bg-white/[0.02] border border-white/10">
          <div className="h-10 px-4 border-b border-white/10 flex items-center text-sm font-medium text-white/90">Hasil</div>

          <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cards.map((card, idx)=>(
              <div key={idx} className="rounded-2xl bg-[#2a0f4a]/40 border border-white/10 overflow-hidden flex flex-col">
                {/* frame 9:16 */}
                <div style={{ aspectRatio: "9 / 16" }} className="bg-[#374151] grid place-items-center relative">
                  {(card.imageUrl || card.posterUrl) ? (
                    card.videoUrl ? (
                      <video src={card.videoUrl} poster={card.imageUrl || card.posterUrl || undefined} controls className="absolute inset-0 w-full h-full object-cover"/>
                    ) : (
                      <img src={card.imageUrl || card.posterUrl} alt={`hasil ${idx+1}`} className="absolute inset-0 w-full h-full object-cover"/>
                    )
                  ) : (
                    <span className="text-white/50 text-sm">Gambar {idx+1} (Rasio 9:16)</span>
                  )}
                </div>

                {/* tombol aksi */}
                <div className="p-2 border-t border-white/10 grid grid-cols-2 gap-2">
                  {isLoggedIn ? (
                    <>
                      <button
                        onClick={()=>handleDownload(idx)}
                        disabled={!(card.imageUrl || card.posterUrl)}
                        className="rounded-lg px-3 py-2 text-sm bg-white/10 hover:bg-white/20">
                        Download
                      </button>
                      <button
                        onClick={()=>handleGenerateVideoFromImage(idx)}
                        disabled={card.loadingVid || !(card.imageUrl || card.posterUrl)}
                        className="rounded-lg px-3 py-2 text-sm bg-gradient-to-r from-purple-500 to-fuchsia-600 shadow">
                        {card.loadingVid ? "Rendering..." : "Generate Video"}
                      </button>
                    </>
                  ) : (
                    <a href={loginUrl} className="col-span-2 w-full inline-flex items-center justify-center px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm shadow">
                      🔐 Login untuk Aksi
                    </a>
                  )}
                </div>

                {/* tombol generate gambar (opsional) */}
                <div className="p-2 pt-0">
                  {isLoggedIn && (
                    <button
                      onClick={()=>handleGenerateImage(idx)}
                      disabled={card.loadingImg}
                      className="w-full rounded-lg px-3 py-2 text-sm bg-white/10 hover:bg-white/20">
                      {card.loadingImg ? "Menghasilkan..." : "Generate Gambar"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {!cards.some(c=>c.imageUrl||c.posterUrl) && !preparing && (
            <div className="grid place-items-center text-center min-h-[240px] text-white/50 text-xs">
              Hasil konten Anda akan muncul di sini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.NafsPages.FotoProduk = FotoProdukPage;
