import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 🔽 AGREGA ESTE BLOQUE EXACTAMENTE AQUÍ:
  preview: {
    allowedHosts: true
  }
})