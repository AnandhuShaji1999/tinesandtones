import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const target = "http://34.136.24.159";

const proxyOptions = {
  target,
  changeOrigin: true,
  secure: false,
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