import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

// https://vitejs.dev/config/
export default defineConfig({
  define: { global: "window" },
  plugins: [
    svelte(),
    // crx({ manifest }),
    VitePWA({
      registerType: "autoUpdate",
      // workbox: {
      //   runtimeCaching: [
      //     {
      //       handler: "NetworkOnly",
      //       // I think this looks for any request to the backend matching this pattern
      //       urlPattern: /http:\/\/localhost:8000\/(.*)/,
      //       method: "POST", // BUG: Might want to add delete and put here
      //       options: {
      //         backgroundSync: {
      //           name: "api-queue",
      //           options: {
      //             maxRetentionTime: 24 * 60,
      //           },
      //         },
      //       },
      //     },
      //   ],
      // },
      manifest: {
        name: "Oolong",
        description: "Opinionated organisation tool",
        theme_color: "#5c7f67",
        icons: [
          {
            src: "icons/192-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/512-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});
