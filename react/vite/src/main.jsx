import "./index.css"; // ← tambahkan ini agar Tailwind aktif

import React from "react";
import { createRoot } from "react-dom/client";
import NafsPremiumApp from "./NafsPremiumApp.jsx";

const rootElement = document.getElementById("root");
createRoot(rootElement).render(
  <React.StrictMode>
    <NafsPremiumApp />
  </React.StrictMode>
);
@tailwind base;
@tailwind components;
@tailwind utilities;

/* opsional: style global kecil */
:root { color-scheme: dark; }
html, body, #root { height: 100%; }
