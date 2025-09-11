/* KOMPONEN KECIL YANG DIPAKAI BANYAK TEMPAT */
export function Badge({ children }) {
  return (
    <span className="ml-2 px-2 py-0.5 text-[10px] rounded-full border bg-purple-500/10 text-purple-300 border-purple-400/30">
      {children}
    </span>
  );
}

export function SideItem({ icon, label, right, active, onClick, elevate = false, dimmed = false }) {
  return (
    <button
      onClick={onClick}
      className={`group w-full flex items-center gap-2 p-2.5 rounded-xl text-left transition-all
        hover:bg-white/5 ${active ? "bg-white/10 ring-1 ring-white/10" : ""}
        ${elevate ? "relative z-50" : ""} ${dimmed ? "opacity-60" : ""}`}
    >
      <span className="h-4 w-4 text-white/80">{icon}</span>
      <span className="text-[13px] text-white/90">{label}</span>
      <span className="ml-auto">{right}</span>
    </button>
  );
}

export function SectionTitle({ children }) {
  return (
    <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/50 px-2 mt-6 mb-2">
      <span>{children}</span>
      <span className="text-white/50">▾</span>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-white/60">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-white/40">{hint}</p>}
    </div>
  );
}

export function GhostInput({ as = "input", className = "", ...rest }) {
  const C = as;
  return (
    <C
      {...rest}
      className={`w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400/30 ${className}`}
    />
  );
}

/* Biarkan ModelSelect bila masih dipakai di view lain */
export function ModelSelect({ value, onChange, disabled }) {
  const models = ["Gemini 2.5 Flash", "GPT-5 Thinking", "Llama 3.1", "Claude 3.5 Sonnet"];
  return (
    <div className="w-full">
      <label className="text-xs text-white/60">Model</label>
      <div className="relative mt-1">
        <select
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-3 py-2 pr-9 text-sm text-white/90 focus:outline-none
            ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {models.map((m) => (
            <option key={m} className="bg-[#1a0b2e]" value={m}>
              {m}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60">▾</span>
      </div>
    </div>
  );
}
