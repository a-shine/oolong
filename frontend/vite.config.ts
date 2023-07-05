import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";
import { crx } from "@crxjs/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  define: { global: "window" },
  plugins: [
    svelte(),
    // crx({ manifest }),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Oolong",
        short_name: "Oolong",
        description: "Opinionated organisation tool.",
        theme_color: "#5c7f67",
        icons: [
          {
            src: "icons/logo/web/favicon.ico",
            type: "image/x-icon",
            sizes: "16x16 32x32",
          },
          {
            src: "icons/logo/web/icon-192.png",
            type: "image/png",
            sizes: "192x192",
          },
          {
            src: "icons/logo/web/icon-512.png",
            type: "image/png",
            sizes: "512x512",
          },
          {
            src: "icons/logo/web/icon-192-maskable.png",
            type: "image/png",
            sizes: "192x192",
            purpose: "maskable",
          },
          {
            src: "icons/logo/web/icon-512-maskable.png",
            type: "image/png",
            sizes: "512x512",
            purpose: "maskable",
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
