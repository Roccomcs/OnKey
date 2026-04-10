import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // Aumentar timeout para conexiones lentas
        timeout: 30000,
        // Asegurar que se pasan TODOS los headers sin modificaciones
        headers: {
          'Connection': 'keep-alive',
        },
      },
    },
  },
})