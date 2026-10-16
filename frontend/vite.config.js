import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Les appels /api et /static sont redirigés vers FastAPI (port 8000)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      '/static': 'http://localhost:8000',
    },
  },
})
