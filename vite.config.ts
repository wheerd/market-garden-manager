import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/market-garden-manager/',
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
      },
      includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png'],
      manifest: {
        "name": "Market Garden Manager",
        "short_name": "Market Garden Manager",
        description: "Market garden management app",
        "icons": [
          {
            "src": "favicon.ico",
            "sizes": "64x64 32x32 24x24 16x16",
            "type": "image/x-icon"
          },
          {
            "src": "logo192.png",
            "type": "image/png",
            "sizes": "192x192"
          },
          {
            "src": "logo512.png",
            "type": "image/png",
            "sizes": "512x512",
            purpose: "any"
          },
          {
            "src": "logo512.png",
            "type": "image/png",
            "sizes": "512x512",
            purpose: 'maskable'
          }
        ],
        "theme_color": "#000000",
      },
    })
  ],
})
