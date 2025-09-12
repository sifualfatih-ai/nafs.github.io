/* global React */
function GenerateAudioPage({ isLoggedIn, loginUrl, Field, GhostInput }) {
  const [scriptText, setScriptText] = React.useState("");
  const [voice, setVoice] = React.useState("Wanita A (WaveNet)");
  const [speed, setSpeed] = React.useState(1.0);
  const [loading, setLoading] = React.useState(false);
  const [audioUrl, setAudioUrl] = React.useState(null);

  async function generateAudio(){
    if(!isLoggedIn) return;
    setLoading(true); setAudioUrl(null);
    try {
      const res = await fetch("/api/generate-audio.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: scriptText, voice, speed })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.ok && data?.audioUrl) {
          setAudioUrl(data.audioUrl);
          setLoading(false);
          return;
        }
      }
      // fallback mock (beep WAV)
      setAudioUrl(makeBeepWavURL());
    } catch {
      setAudioUrl(makeBeepWavURL());
    } finally {
      setLoading(false);
    }
  }

  // ======= MOCK: WAV dataURL 440Hz 0.6s =======
  function makeBeepWavURL(){
    const sampleRate=44100, duration=0.6, freq=440;
    const samples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + samples*2);
    const view = new DataView(buffer);
    // RIFF/WAVE header
    writeStr(view, 0, "RIFF"); view.setUint32(4, 36+samples*2, true);
    writeStr(view, 8, "WAVE"); writeStr(view, 12, "fmt "); view.setUint32(16,16,true);
    view.setUint16(20,1,true); view.setUint16(22,1,true); view.setUint32(24,sampleRate,true);
    view.setUint32(28,sampleRate*2,true); view.setUint16(32,2,true); view.setUint16(34,16,true);
    writeStr(view, 36, "data"); view.setUint32(40,samples*2,true);
    let off=44;
    for(let i=0;i<samples;i++){
      const t=i/sampleRate;
      const s=Math.sin(2*Math.PI*freq*t)*0.25; // volume
      view.setInt16(off, s*32767, true); off+=2;
    }
    const blob = new Blob([view], {type:"audio/wav"});
    return URL.createObjectURL(blob);
  }
  function writeStr(v, o, s){ for(let i=0;i<s.length;i++) v.setUint8(o+i, s.charCodeAt(i)); }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[520px_minmax(0,1fr)]">
      {/* kiri */}
      <div className="p-4 border-b lg:border-b-0 lg:border-r border-white/10 space-y-4">
        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
          <div className="text-[13px] font-medium mb-2">1. Tulis Naskah Anda</div>
          <GhostInput as="textarea" rows={7}
            value={scriptText} onChange={e=>setScriptText(e.target.value)}
            placeholder="Ketik atau tempel naskah voice over di sini…" disabled={!isLoggedIn}/>
        </div>

        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
          <div className="text-[13px] font-medium mb-2">2. Pilih Aktor Suara</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              "Wanita A (WaveNet)","Wanita B (WaveNet)","Pria A (WaveNet)",
              "Pria B (WaveNet)","Wanita C (Standard)","Pria C (Standard)"
            ].map((v)=>(
              <button key={v} disabled={!isLoggedIn}
                onClick={()=>setVoice(v)}
                className={`text-left rounded-lg border border-white/10 p-3 bg-white/5 hover:bg-white/10 transition ${!isLoggedIn && "opacity-60 cursor-not-allowed"} ${voice===v ? "ring-1 ring-fuchsia-400":""}`}>
                <div className="text-sm font-medium">{v}</div>
                <div className="text-[11px] text-white/60">{v.includes("WaveNet") ? "jernih, ekspresif" : "natural, ringan"}</div>
                <div className="mt-2">
                  <span className="inline-block text-[11px] px-2 py-1 rounded bg-white/10 border border-white/10">🔊 Dengar Contoh</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="text-xs text-white/60">Kecepatan Bicara</div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <input type="range" min="50" max="150" value={speed*100}
                     onChange={e=>setSpeed(Number(e.target.value)/100)}
                     disabled={!isLoggedIn} className="w-full accent-fuchsia-500"/>
              <span className="text-xs text-white/70">{speed.toFixed(2)}x</span>
            </div>
          </div>

          <div className="mt-3">
            {isLoggedIn ? (
              <button onClick={(e)=>{e.preventDefault(); generateAudio();}}
                      disabled={loading}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">
                {loading ? "Generating..." : "Generate Voice Over"}
              </button>
            ) : (
              <a href={loginUrl} className="relative z-50 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow">
                🔐 Silakan login untuk menggunakan fitur ini
              </a>
            )}
          </div>
        </div>
      </div>

      {/* kanan */}
      <div className="p-4">
        <div className="h-full min-h-[360px] rounded-xl bg-black/40 border border-white/10 overflow-hidden">
          <div className="h-10 px-4 border-b border-white/10 flex items-center text-sm font-medium text-white/90">Hasil Voice Over</div>
          <div className="h-[calc(100%-40px)] grid place-items-center text-center p-6">
            {!audioUrl ? (
              <div>
                <div className="text-4xl text-white/50">{loading ? "⏳" : "🎙️"}</div>
                <p className="mt-2 text-xs text-white/50">{loading ? "Sedang membuat audio..." : "Hasil audio Anda akan muncul di sini."}</p>
              </div>
            ) : (
              <audio controls src={audioUrl} className="w-full max-w-xl" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
window.NafsPages.GenerateAudio = GenerateAudioPage;
