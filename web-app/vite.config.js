import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8014',
        changeOrigin: true,
        secure: false,
      },
      '/avatars': {
        target: 'http://localhost:8014',
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: 'http://localhost:8014',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})