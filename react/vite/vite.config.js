import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// App kamu diakses di https://nafsflow.com/react/vite/
export default defineConfig({
  plugins: [react()],
  base: "/react/vite/",           // penting untuk GitHub Pages subfolder
});
