import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('react-dom') || id.includes('/react/')) {
            return 'vendor-react';
          }

          if (id.includes('react-router')) {
            return 'vendor-router';
          }

          if (id.includes('@reduxjs') || id.includes('react-redux')) {
            return 'vendor-state';
          }

          if (id.includes('@tiptap')) {
            return 'vendor-editor';
          }

          if (id.includes('lucide-react') || id.includes('react-icons')) {
            return 'vendor-icons';
          }
        },
      },
    },
  },
  server: {
    host: true, // Listen on all addresses for Docker
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Required for Docker on some systems
    },
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
});
