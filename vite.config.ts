import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
    // The API server writes character/data JSON files under server/data on
    // every save. Vite's dev watcher covers the whole project by default, so
    // without this it treats those writes as unrecognized file changes and
    // forces a full page reload after every edit.
    watch: {
      ignored: ['**/server/data/**'],
    },
  },
})
