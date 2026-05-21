import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('/api'),
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/embed': { target: 'http://127.0.0.1:5000', changeOrigin: true },
    },
  },
})
