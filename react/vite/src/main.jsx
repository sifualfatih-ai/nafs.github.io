import "./index.css"; // ← penting agar Tailwind aktif

import React from "react";
import { createRoot } from "react-dom/client";
import NafsPremiumApp from "./NafsPremiumApp.jsx";

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("❌ Elemen #root tidak ditemukan di index.html");
} else {
  createRoot(rootElement).render(
    <React.StrictMode>
      <NafsPremiumApp />
    </React.StrictMode>
  );
}
