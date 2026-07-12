import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createApp } from './server.js'

// ─── Inline Vite Plugin: Mount Express API ──────────────────
// Embeds the Express API server into the Vite dev server so
// `npm run dev` serves BOTH the frontend and the API on the same port.
function apiServerPlugin() {
  const apiApp = createApp()
  return {
    name: 'api-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.startsWith('/api') || req.url.startsWith('/images')) {
          apiApp(req, res, next)
        } else {
          next()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiServerPlugin()],
  server: {
    host: true,
    allowedHosts: true,
    watch: {
      // Prevent infinite reload loop: API writes to data/*.json,
      // and Vite watching them would trigger page reloads endlessly.
      ignored: ['**/data/**'],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'framer-motion': ['framer-motion'],
        },
      },
    },
  },
})
