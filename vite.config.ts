import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';

// Get current file directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@assets": path.resolve(__dirname, "./attached_asset"),
    },
  },
  root: path.resolve(__dirname, "./client"),
  build: {
    outDir: path.resolve(__dirname, "./dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true,
  },
});
