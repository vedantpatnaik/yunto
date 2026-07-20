import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // Bind all interfaces so the app is reachable from a phone on the same
    // Wi-Fi (http://<your-lan-ip>:5173) for on-device demos.
    host: true,
  },
});
