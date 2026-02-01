import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [react(), tailwindcss()],
    build: {
      chunkSizeWarningLimit: 1000, // Increase chunk size warning limit to 1000kb
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'chart-vendor': ['recharts'],
            'utils': ['axios', 'moment'],
          }
        }
      }
    }
  }

  // Only set base path for production builds (GitHub Pages)
  if (command === 'build') {
    config.base = '/Task-Manager/'
  }

  return config
})
