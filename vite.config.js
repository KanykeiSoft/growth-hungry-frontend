import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // 👇 локально — работает без префикса, на GitHub Pages — с ним
  base: mode === "production" ? "/growth-hungry-frontend/" : "/",
}));

