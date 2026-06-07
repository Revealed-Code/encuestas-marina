import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // 1. Le decimos a Vite que escuche en el puerto que Railway le ordene
    port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
    
    // 2. IMPORTANTE: '0.0.0.0' le permite a Railway asomarse dentro del contenedor
    host: '0.0.0.0' 
  }
})