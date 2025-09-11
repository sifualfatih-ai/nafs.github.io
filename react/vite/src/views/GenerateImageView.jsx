import { Field, GhostInput, ModelSelect } from "../components/Common.jsx";

export default function GenerateImageView({ isLoggedIn, model, setModel, loginUrl }) {
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)]">
      <div className="p-4 border-b lg:border-b-0 lg:border-r border-white/10 space-y-3">
        <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3">
          <div className="text-[13px] font-medium mb-3">Generate Image</div>

          <div className="space-y-3">
            <Field label="Gambar Referensi (Opsional)">
              <div className="border border-dashed border-white/15 rounded-lg px-4 py-6 text-center bg-white/[0.02]">
                <div className="text-white/60 text-xl">⬆️</div>
                <div className="text-xs text-white/50 mt-1">Klik untuk unggah</div>
              </div>
            </Field>

            <Field label="Prompt">
              <GhostInput as="textarea" rows={4} placeholder="A cinematic shot of a lone astronaut..." disabled={!isLoggedIn} />
            </Field>

            <Field label="Negative Prompt (Opsional)">
              <GhostInput as="textarea" rows={2} placeholder="e.g., blurry, low quality, text" disabled={!isLoggedIn} />
            </Field>

            <ModelSelect value={model} onChange={setModel} disabled={!isLoggedIn} />

            <Field label="Aspect Ratio">
              <div className="relative">
                <GhostInput placeholder="9:16" disabled={!isLoggedIn} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50">▾</span>
              </div>
            </Field>

            <div className="flex gap-2 pt-1">
              {isLoggedIn ? (
                <button
                  onClick={(e)=>e.preventDefault()}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow"
                >
                  Generate
                </button>
              ) : (
                <a
                  href={loginUrl}
                  className="relative z-50 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow"
                >
                  🔐 Login untuk Generate
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="h-full min-h=[360px] rounded-xl bg-black/40 border border-white/10 overflow-hidden">
          <div className="h-10 px-4 border-b border-white/10 flex items-center text-sm font-medium text-white/90">Hasil</div>
          <div className="h-[calc(100%-40px)] grid place-items-center text-center p-6">
            <div>
              <div className="text-4xl text-white/50">🖼️</div>
              <p className="mt-2 text-xs text-white/50">Hasil gambar Anda akan muncul di sini.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
