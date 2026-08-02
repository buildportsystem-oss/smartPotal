import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/go2rtc': {
        target: 'http://localhost:1984',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/go2rtc/, '')
      }
    }
  }
})
