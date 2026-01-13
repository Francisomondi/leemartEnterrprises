import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',  // ← Add this line (or './' as alternative—see below)
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
      },
    },
  },
});