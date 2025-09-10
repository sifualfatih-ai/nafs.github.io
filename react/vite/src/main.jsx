// react/vite/src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import NafsPremiumApp from "./NafsPremiumApp.jsx";

const el = document.getElementById("root");
createRoot(el).render(
  <React.StrictMode>
    <NafsPremiumApp />
  </React.StrictMode>
);
