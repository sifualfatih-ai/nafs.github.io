import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Sparkles,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Megaphone,
  PanelsTopLeft,
  Waves,
  Share2,
  Camera,
  GraduationCap,
  Home,
  Settings,
  ChevronDown,
  Globe,
  Crown,
  LogIn,
  Wand2,
} from "lucide-react";

// Small badge component
const Badge = ({ children, variant = "new" }) => {
  const base =
    "ml-2 px-2 py-0.5 text-[10px] rounded-full border inline-flex items-center gap-1";
  const styles =
    variant === "new"
      ? "bg-purple-500/10 text-purple-300 border-purple-400/30"
      : "bg-white/5 text-white/70 border-white/10";
  return <span className={`${base} ${styles}`}>{children}</span>;
};

const SideItem = ({
  icon: Icon,
  label,
  active,
  onClick,
  right,
}) => (
  <button
    onClick={onClick}
    className={`group w-full flex items-center gap-2 p-2.5 rounded-xl transition-all text-left hover:bg-white/5 ${
      active ? "bg-white/10 ring-1 ring-white/10" : ""
    }`}
  >
    <Icon className="h-4 w-4 text-white/80" />
    <span className="text-[13px] text-white/90">{label}</span>
    <span className="ml-auto">{right}</span>
  </button>
);

const SectionTitle = ({ children }) => (
  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-white/50 px-2 mt-6 mb-2">
    <span>{children}</span>
    <ChevronDown className="h-3 w-3" />
  </div>
);

const ModelSelect = ({ value, onChange }) => {
  const models = [
    "Gemini 2.5 Flash",
    "GPT-5 Thinking",
    "Llama 3.1",
    "Claude 3.5 Sonnet",
  ];
  return (
    <div className="w-full">
      <label className="text-xs text-white/60">Model</label>
      <div className="relative mt-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl bg-white/5 border border-white/10 px-3 py-2 pr-9 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        >
          {models.map((m) => (
            <option key={m} className="bg-[#1a0b2e]" value={m}>
              {m}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
      </div>
    </div>
  );
};

const ContentPlaceholder = ({ current }) => (
  <div className="flex-1 grid place-items-center">
    <div className="text-center">
      <p className="text-white/60 text-sm">Mulai percakapan dengan mengetik di bawah.</p>
      <p className="mt-2 text-xs text-white/40">Tampilan untuk <span className="text-white/70">{current}</span> akan diisi materi visualnya kemudian.</p>
    </div>
  </div>
);

export default function NafsPremiumApp() {
  const [active, setActive] = useState("Chat");
  const [model, setModel] = useState("Gemini 2.5 Flash");

  const items = useMemo(
    () => [
      { icon: MessageSquare, label: "Chat" },
      { icon: ImageIcon, label: "Generate Image" },
      { icon: Video, label: "Generate Video" },
      { icon: Megaphone, label: "Iklan Produk", right: <Badge>New</Badge> },
      { icon: PanelsTopLeft, label: "Canvas AI", right: <Badge>New</Badge> },
      { icon: Waves, label: "Studio Suara AI", right: <Badge>New</Badge> },
      { icon: Share2, label: "Tiktok Affiliate", right: <span className="text-[10px] text-white/50">Konten UGC</span> },
      { icon: Camera, label: "Foto Produk", right: <span className="text-[10px] text-white/50">Konten UGC</span> },
    ],
    []
  );

  const secondary = [
    { icon: GraduationCap, label: "E-Course", right: <span className="text-[10px] text-white/50">Tiktok Affiliate</span> },
    { icon: Home, label: "Halaman Utama" }, // opens main web without login – we simulate via toast
    { icon: Settings, label: "Settings" },
  ];

  const handleClick = (label) => {
    if (label === "Halaman Utama") {
      // Simulate navigating to public website
      alert("Membuka halaman utama Nafs (akses tanpa login) …");
      return;
    }
    setActive(label);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#2a0f4a] via-[#1a0b2e] to-[#0c0516] text-white">
      <div className="mx-auto max-w-[1400px] p-3 lg:p-6">
        <div className="flex gap-3 lg:gap-6">
          {/* Sidebar */}
          <aside className="w-[190px] lg:w-[210px] shrink-0">
            <div className="sticky top-3">
              {/* Logo */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-400 to-fuchsia-600 grid place-items-center shadow-lg shadow-fuchsia-900/30">
                  <Crown className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-lg font-semibold tracking-wide">Nafs</div>
                  <div className="text-[11px] text-white/60 -mt-0.5">Premium</div>
                </div>
              </div>

              {/* Access box */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 mb-3">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-purple-300" />
                  <span className="font-medium">Akses Premium</span>
                </div>
                <p className="text-[11px] text-white/60 mt-2 leading-relaxed">
                  Ini adalah laman premium. Silakan <strong className="text-white">login & berlangganan</strong> untuk mengakses seluruh fitur.
                </p>
              </div>

              <SectionTitle>Menu</SectionTitle>
              <div className="space-y-1">
                {items.map((it) => (
                  <SideItem
                    key={it.label}
                    icon={it.icon}
                    label={it.label}
                    right={it.right}
                    active={active === it.label}
                    onClick={() => handleClick(it.label)}
                  />
                ))}
              </div>

              <SectionTitle>Lainnya</SectionTitle>
              <div className="space-y-1">
                {secondary.map((it) => (
                  <SideItem
                    key={it.label}
                    icon={it.icon}
                    label={it.label}
                    right={it.right}
                    active={active === it.label}
                    onClick={() => handleClick(it.label)}
                  />
                ))}
              </div>

              {/* Removed: "Tonskay AI" with lock – intentionally omitted */}
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl min-h-[76vh] flex flex-col overflow-hidden">
            {/* Header bar (subtle to match reference) */}
            <div className="h-12 border-b border-white/10 px-4 flex items-center justify-between">
              <div className="text-sm text-white/70">
                {active === "Halaman Utama" ? "Web Utama (tanpa login)" : active}
              </div>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Globe className="h-3.5 w-3.5" />
                <span>Tampilan tetap konsisten di semua menu</span>
              </div>
            </div>

            {/* Empty state / placeholder */}
            <ContentPlaceholder current={active} />

            {/* Bottom composer like the reference */}
            <div className="border-t border-white/10 p-3">
              <div className="flex flex-col lg:flex-row items-stretch gap-3">
                <div className="w-full lg:w-72">
                  <ModelSelect value={model} onChange={setModel} />
                </div>
                <div className="flex-1 grid grid-cols-1">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-sm text-white/60">
                    Silakan login untuk memulai chat.
                  </div>
                </div>
                <div className="w-full lg:w-auto grid place-items-center">
                  <button className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-sm font-medium shadow-lg shadow-fuchsia-900/20">
                    <LogIn className="h-4 w-4" /> Login untuk Menggunakan Chat
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-white/50">
                <Wand2 className="h-3.5 w-3.5" />
                <span>Berlangganan diperlukan untuk akses penuh.</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
