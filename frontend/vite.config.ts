import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  build: {
    // Emite aviso acima de 300KB (era 500KB)
    chunkSizeWarningLimit: 300,

    rollupOptions: {
      output: {
        // ── Code splitting manual por categoria ──────────────────────
        manualChunks(id) {
          // Vendor: React core
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          // Vendor: Lucide icons (pesado)
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide';
          }
          // Vendor: Leaflet + react-leaflet (mapa)
          if (id.includes('node_modules/leaflet') ||
              id.includes('node_modules/react-leaflet') ||
              id.includes('node_modules/@react-leaflet')) {
            return 'vendor-leaflet';
          }
          // Vendor: date utilities
          if (id.includes('node_modules/date-fns') ||
              id.includes('node_modules/dayjs')) {
            return 'vendor-dates';
          }
          // Vendor: restante de node_modules
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
          // App: views (cada view em seu chunk)
          if (id.includes('/views/')) {
            const match = id.match(/\/views\/([^/]+)\.tsx?$/);
            if (match) return `view-${match[1].toLowerCase()}`;
          }
        },
      },
    },
  },
});
