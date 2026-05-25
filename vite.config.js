import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/calculator/',
  publicDir: 'public',
  build: {
    target: 'es2015',
    cssTarget: 'chrome61',
    chunkSizeWarningLimit: 2000,
  }
})
