import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Oolong',
        description: 'A life companion',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icons/192-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/512-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ]
})
