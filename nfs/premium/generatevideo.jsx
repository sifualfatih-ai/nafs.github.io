/* global React */
function GenerateVideoPage({ isLoggedIn, loginUrl, Field, GhostInput }) {
  const [model] = React.useState("VEO 2.0");
  const [prompt, setPrompt] = React.useState("");
  const [ratio, setRatio]   = React.useState("9:16");
  const [dur, setDur]       = React.useState("8");

  const [refFile, setRefFile] = React.useState(null);
  const [refPreview, setRefPreview] = React.useState(null);

  const [loading, setLoading] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState(null);
  const [posterUrl, setPosterUrl] = React.useState(null);
  const fileInputRef = React.useRef(null);

  function onPickFile(){ if(!isLoggedIn) return; fileInputRef.current?.click(); }
  function onFileChange(e){
    const f = e.target.files?.[0]; if(!f) return;
    setRefFile(f); setRefPreview(URL.createObjectURL(f));
  }

  async function generateVideo() {
    if(!isLoggedIn) return;
    setLoading(true); setVideoUrl(null); setPosterUrl(null);
    try {
      const fd = new FormData();
      if (refFile) fd.append("reference", refFile);
      fd.append("prompt", prompt);
      fd.append("model", model);
      fd.append("ratio", ratio);
      fd.append("duration", dur);

      const res = await fetch("/api/generate-video.php", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && data?.videoUrl) {
          setVideoUrl(data.videoUrl);
          setPosterUrl(data.posterUrl || null);
          setLoading(false);
          return;
        }
      }
      // fallback mock
      const mockPoster = await makeMockPoster(prompt, ratio);
      setPosterUrl(mockPoster);
      // video dummy: gunakan poster sebagai gambar dalam <video> (tanpa play), atau blob mp4 kecil bila tersedia.
      setVideoUrl(null);
    } catch {
      const mockPoster = await makeMockPoster(prompt, ratio);
      setPosterUrl(mockPoster);
      setVideoUrl(null);
    } finally {
      setLoading(false);
    }
  }

  function makeMockPoster(txt, ratioStr){
    // gunakan util dari halaman image (versi ringkas)
    const [w,h] = ratioStr==="16:9" ? [1024,576] : ratioStr==="1:1"?[768,768] : [768,1365];
    const c = document.createElement("canvas"); c.width=w; c.height=h;
    const ctx = c.getContext("2d");
    const g=ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,"#1d4ed8"); g.addColorStop(1,"#a21caf");
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    ctx.fillStyle="rgba(255,255,255,0.9)"; ctx.font=`${Math.max(22, Math.floor(w/24))}px sans-serif`;
    ctx.fillText("Mock Video", 40, 80);
    ctx.font=`${Math.max(16, Math.floor(w/40))}px sans-serif`;
    ctx.fillText((txt||"Poster") , 40, 130);
    return Promise.resolve(c.toDataURL("image/png"));
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)]">
      {/* kiri */}
      <div className="p-4 border-b lg:border-b-0 lg:border-r border-white/10 space-y-3">
        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
          <div className="text-[13px] font-medium mb-3">Generate Video</div>
          <div className="space-y-3">
            <Field label="Gambar Referensi (Opsional)">
              <div onClick={onPickFile}
                   className={`border border-dashed border-white/15 rounded-lg px-4 py-6 text-center bg-white/[0.02] ${!isLoggedIn?"opacity-60 cursor-not-allowed": "cursor-pointer"}`}>
                {refPreview ? (
                  <img src={refPreview} alt="ref" className="mx-auto max-h-40 rounded-lg object-contain"/>
                ) : (
                  <>
                    <div className="text-white/60 text-xl">⬆️</div>
                    <div className="text-xs text-white/50 mt-1">Klik untuk unggah</div>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden"/>
            </Field>

            <Field label="Model">
              <GhostInput value={model} onChange={()=>{}} placeholder="VEO 2.0" disabled={!isLoggedIn} />
            </Field>

            <Field label="Prompt">
              <GhostInput as="textarea" rows={4} placeholder="A neon hologram of a cat driving..."
                value={prompt} onChange={(e)=>setPrompt(e.target.value)} disabled={!isLoggedIn}/>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Aspect Ratio">
                <select value={ratio} onChange={e=>setRatio(e.target.value)} disabled={!isLoggedIn}
                  className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90 focus:outline-none">
                  {["9:16","16:9","1:1"].map(r=><option key={r} className="bg-[#1a0b2e]" value={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="Durasi (detik)">
                <GhostInput value={dur} onChange={(e)=>setDur(e.target.value)} placeholder="8" disabled={!isLoggedIn}/>
              </Field>
            </div>

            <div className="flex gap-2 pt-1">
              {isLoggedIn ? (
                <button onClick={(e)=>{e.preventDefault(); generateVideo();}}
                        disabled={loading}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">
                  {loading ? "Generating..." : "Generate Video"}
                </button>
              ) : (
                <a href={loginUrl} className="relative z-50 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">
                  🔐 Login untuk Generate
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* kanan */}
      <div className="p-4">
        <div className="h-full min-h-[360px] rounded-xl bg-black/40 border border-white/10 overflow-hidden">
          <div className="h-10 px-4 border-b border-white/10 flex items-center text-sm font-medium text-white/90">Hasil</div>
          <div className="h-[calc(100%-40px)] grid place-items-center text-center p-6">
            {!videoUrl && !posterUrl ? (
              <div>
                <div className="text-4xl text-white/50">{loading ? "⏳" : "📹"}</div>
                <p className="mt-2 text-xs text-white/50">{loading ? "Sedang merender video..." : "Hasil video Anda akan muncul di sini."}</p>
              </div>
            ) : videoUrl ? (
              <video src={videoUrl} poster={posterUrl||undefined} controls className="max-h-[60vh] rounded-xl"/>
            ) : (
              <img src={posterUrl} alt="poster" className="max-h-[60vh] rounded-xl object-contain"/>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
window.NafsPages.GenerateVideo = GenerateVideoPage;
