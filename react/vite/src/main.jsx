import React from "react";
import { createRoot } from "react-dom/client";
import NafsPremiumApp from "./NafsPremiumApp.jsx";

const el = document.getElementById("root");
if (!el) {
  console.error("❌ #root tidak ditemukan di index.html");
} else {
  console.log("✅ Mounting NafsPremiumApp…");
  createRoot(el).render(
    <React.StrictMode>
      <NafsPremiumApp />
    </React.StrictMode>
  );
}
