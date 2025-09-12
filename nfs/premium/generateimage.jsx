/* global React */
function GenerateImagePage({ isLoggedIn, loginUrl, Field, GhostInput, ModelSelect }) {
  const [model, setModel] = React.useState("Gemini 2.5 Flash");
  const [prompt, setPrompt] = React.useState("");
  const [neg, setNeg]     = React.useState("");
  const [ratio, setRatio] = React.useState("9:16");

  const [refFile, setRefFile] = React.useState(null);
  const [refPreview, setRefPreview] = React.useState(null);

  const [loading, setLoading] = React.useState(false);
  const [resultUrl, setResultUrl] = React.useState(null);
  const fileInputRef = React.useRef(null);

  function onPickFile(){
    if(!isLoggedIn) return;
    fileInputRef.current?.click();
  }
  function onFileChange(e){
    const f = e.target.files?.[0];
    if(!f) return;
    setRefFile(f);
    const url = URL.createObjectURL(f);
    setRefPreview(url);
  }

  async function generate() {
    if(!isLoggedIn) return;
    setLoading(true);
    setResultUrl(null);

    // kirim ke server (Hostinger) — aman via .env di server
    try {
      const fd = new FormData();
      if (refFile) fd.append("reference", refFile);
      fd.append("prompt", prompt);
      fd.append("negative", neg);
      fd.append("model", model);
      fd.append("ratio", ratio);

      const res = await fetch("/api/generate-image.php", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && data?.imageUrl) {
          setResultUrl(data.imageUrl);
          setLoading(false);
          return;
        }
      }
      // fallback mock (kalau endpoint belum ada)
      const mock = await makeMockImage(prompt, ratio);
      setResultUrl(mock);
    } catch {
      const mock = await makeMockImage(prompt, ratio);
      setResultUrl(mock);
    } finally {
      setLoading(false);
    }
  }

  // ===== MOCK: bikin gambar canvas dgn teks =====
  function makeMockImage(txt, ratioStr){
    const [w,h] = ratioStr==="1:1" ? [768,768]
                  : ratioStr==="16:9" ? [1024,576]
                  : ratioStr==="4:5" ? [800,1000]
                  : [768,1365]; // 9:16 default
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d");
    // bg gradien
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0,"#3b0764"); g.addColorStop(1,"#0e7490");
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
    // watermark + prompt
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = `${Math.max(18, Math.floor(w/28))}px sans-serif`;
    wrapText(ctx, txt || "Mock Image", 40, 80, w-80, Math.max(26, Math.floor(w/36)));
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = `${Math.max(14, Math.floor(w/46))}px monospace`;
    ctx.fillText(`ratio ${ratioStr} • model ${model}`, 40, h-40);
    return Promise.resolve(c.toDataURL("image/png"));
  }
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "", yy=y;
    for (let n=0;n<words.length;n++){
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n>0) {
        ctx.fillText(line, x, yy);
        line = words[n] + " ";
        yy += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, yy);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)]">
      {/* kiri */}
      <div className="p-4 border-b lg:border-b-0 lg:border-r border-white/10 space-y-3">
        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
          <div className="text-[13px] font-medium mb-3">Generate Image</div>
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

            <Field label="Prompt">
              <GhostInput as="textarea" rows={4} placeholder="A cinematic shot of a lone astronaut..."
                value={prompt} onChange={(e)=>setPrompt(e.target.value)} disabled={!isLoggedIn}/>
            </Field>

            <Field label="Negative Prompt (Opsional)">
              <GhostInput as="textarea" rows={2} placeholder="e.g., blurry, low quality, text"
                value={neg} onChange={(e)=>setNeg(e.target.value)} disabled={!isLoggedIn}/>
            </Field>

            <ModelSelect value={model} onChange={setModel} disabled={!isLoggedIn} />

            <Field label="Aspect Ratio">
              <select value={ratio} onChange={e=>setRatio(e.target.value)} disabled={!isLoggedIn}
                className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-3 py-2 pr-9 text-sm text-white/90 focus:outline-none">
                {["9:16","16:9","1:1","4:5"].map(r=><option key={r} className="bg-[#1a0b2e]" value={r}>{r}</option>)}
              </select>
            </Field>

            <div className="flex gap-2 pt-1">
              {isLoggedIn ? (
                <button onClick={(e)=>{e.preventDefault(); generate();}}
                        disabled={loading}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">
                  {loading ? "Generating..." : "Generate"}
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
            {!resultUrl ? (
              <div>
                <div className="text-4xl text-white/50">{loading ? "⏳" : "🖼️"}</div>
                <p className="mt-2 text-xs text-white/50">
                  {loading ? "Sedang membuat gambar..." : "Hasil gambar Anda akan muncul di sini."}
                </p>
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
window.NafsPages.GenerateImage = GenerateImagePage;
