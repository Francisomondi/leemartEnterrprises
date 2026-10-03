import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Read environment variables from the root .env
  envDir: fileURLToPath(new URL("../", import.meta.url)),

  server: {
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