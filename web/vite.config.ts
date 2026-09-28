import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import BRAND from "../brand.json";

const repoRoot = new URL("..", import.meta.url).pathname;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "insync-brand-html",
      transformIndexHtml(html) {
        return html.replace(
          "%BRAND_TITLE%",
          `${BRAND.displayName} · ${BRAND.englishName}`,
        );
      },
    },
  ],
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
      "@brand": new URL("../brand.json", import.meta.url).pathname,
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
    host: true,
    port: 5173,
  },
});
