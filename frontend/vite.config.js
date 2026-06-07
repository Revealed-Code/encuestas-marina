import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    // 🔽 Ponemos la URL exacta de Railway y además el comodín de seguridad
    allowedHosts: [
      'wholesome-fulfillment-production-c566.up.railway.app',
      '.railway.app'
    ]
  }
})