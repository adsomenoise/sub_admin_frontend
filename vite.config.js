import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/subadmin/' : '/',
  define: {
    'process.env': process.env
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'build'
  }
}))