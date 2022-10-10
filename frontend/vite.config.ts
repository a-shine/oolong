import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [{
          handler: 'NetworkOnly',
          urlPattern: /http:\/\/localhost:8080\/(.*)/, // looks for any request mactching this pattern and cahces them if offline
          method: 'POST', // TODO: might want to add delete and put here
          options: {
            backgroundSync: {
              name: 'api-queue',
              options: {
                maxRetentionTime: 24 * 60
              }
            }
          }
        }]
      },
      manifest: {
        name: 'Oolong',
        description: 'Opinionated organisation tool',
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
