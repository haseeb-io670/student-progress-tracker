import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['localhost', '127.0.0.1', 'client.imedia5.com', 'server.imedia5.com'],
    proxy: {
      '/api': {
        target: 'http://sr.sosessentials.online',
        changeOrigin: false,
      }
    }
  }
})
