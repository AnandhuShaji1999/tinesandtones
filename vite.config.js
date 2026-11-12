import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const target = "https://unshored-esoterically-damon.ngrok-free.dev";

const proxyOptions = {
  target,
  changeOrigin: true,
  secure: true,
  headers: { "ngrok-skip-browser-warning": "true" },
};

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": proxyOptions,
      "/health": proxyOptions,
    },
  },
});