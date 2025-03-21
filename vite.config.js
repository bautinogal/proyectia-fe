import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/dolarito-history": {
        target: "https://www.dolarito.ar",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dolarito-history/, "/api/frontend/history"),
      },
    },
  },
})
