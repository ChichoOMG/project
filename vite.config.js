import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa' //vitepwa

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // Registra automáticamente el SW
      manifest: {
        name: "Mi PWA con Vue",
        short_name: "MiPWA",
        description: "Mi aplicación Vue convertida en PWA",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",  // Asegura que el inicio de la app esté bien definido
        scope: "/",      // Define el alcance de la PWA
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst'
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst'
          }
        ]
      },
      devOptions: {
        enabled: true, // Habilita el PWA en modo desarrollo
        type: "module"
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
