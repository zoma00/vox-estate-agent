import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev proxy forwards /api to the local FastAPI backend (uvicorn on 127.0.0.1:8000)
export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist'
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
