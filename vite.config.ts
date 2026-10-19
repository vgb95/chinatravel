import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type PluginOption } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Modo "singlefile": genera un único index.html autocontenido (respaldo offline),
// sin service worker. El modo normal despliega la PWA en GitHub Pages.
export default defineConfig(({ command, mode, isPreview }) => {
  const singlefile = mode === 'singlefile'

  const plugins: PluginOption[] = [react(), tailwindcss()]

  if (singlefile) {
    plugins.push(viteSingleFile())
  } else {
    plugins.push(
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
        manifest: {
          name: 'China Trip 2026',
          short_name: 'China Trip',
          description:
            'Guía offline del viaje a China: Guangzhou, Shenzhen, Hong Kong, Yangshuo, Guilin, Shanghai, Suzhou, Hangzhou y Chongqing',
          lang: 'es',
          dir: 'ltr',
          start_url: './',
          scope: './',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#FAF7F2',
          theme_color: '#B3132C',
          categories: ['travel', 'lifestyle'],
          icons: [
            { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'pwa-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
        },
        devOptions: { enabled: false },
      }),
    )
  }

  return {
    // En preview mantenemos el base de producción para poder probar la PWA tal cual se despliega.
    base: singlefile ? './' : command === 'build' || isPreview ? '/chinatravel/' : '/',
    resolve: singlefile
      ? {
          // Sin plugin PWA en modo singlefile: resolvemos el import virtual a un stub.
          alias: { 'virtual:pwa-register': fileURLToPath(new URL('./src/lib/pwa-register-stub.ts', import.meta.url)) },
        }
      : undefined,
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    plugins,
    build: {
      outDir: singlefile ? 'dist-single' : 'dist',
      assetsInlineLimit: singlefile ? 100_000_000 : 4096,
    },
  }
})
