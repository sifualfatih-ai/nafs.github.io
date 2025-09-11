import "./index.css";  // ← wajib agar Tailwind aktif
import React from "react";
import { createRoot } from "react-dom/client";
import NafsPremiumApp from "./NafsPremiumApp.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode><NafsPremiumApp/></React.StrictMode>
);
