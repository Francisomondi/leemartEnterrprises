import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],

  envDir: fileURLToPath(
    new URL("../", import.meta.url)
  ),

  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },

    proxy: {
      "/api": {
        target: "http://localhost:5000",
      },
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});