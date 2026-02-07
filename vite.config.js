import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.REACT_APP_API_BASE_URL': JSON.stringify(process.env.REACT_APP_API_BASE_URL || ''),
    'process.env.REACT_APP_TALENT_BASE_URL': JSON.stringify(process.env.REACT_APP_TALENT_BASE_URL || ''),
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'build'
  }
})