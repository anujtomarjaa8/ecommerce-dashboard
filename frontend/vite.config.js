import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Dev-only proxy: forwards /api/* to the local Express server.
  // In production on Vercel, vercel.json routes /api/* to the
  // serverless function directly — no proxy needed.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  },

  // Expose VITE_API_URL to the client bundle.
  // Leave it unset (or set to '') for Vercel — relative /api calls
  // are handled by the vercel.json route rewrite.
  define: {
    __API_BASE__: JSON.stringify(process.env.VITE_API_URL || '/api'),
  }
})
