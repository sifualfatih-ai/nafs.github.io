// react/vite/src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import NafsPremiumApp from "./NafsPremiumApp.jsx";

const rootEl = document.getElementById("root");
createRoot(rootEl).render(
  <React.StrictMode>
    <NafsPremiumApp />
  </React.StrictMode>
);
