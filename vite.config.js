import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
  visualizer({
    filename: 'dist/stats.html',
    open: false,
    gzipSize: true,
    brotliSize: true,
  }),
  compression({ algorithm: 'brotliCompress' }),
  ],
  build: {
    rollupOptions: {
      output: {
        // Match by path, not package name: listing only top-level packages let
        // React's runtime (jsx, scheduler) land in the 3D chunk, which forced the
        // whole 3D stack onto the first page load. 3D libraries are left to load
        // with the lazy screens that use them.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'vendor-react'
          if (/node_modules[\\/]three[\\/]/.test(id)) return 'vendor-three'
          if (/node_modules[\\/](framer-motion|motion-dom|motion-utils)[\\/]/.test(id)) return 'vendor-motion'
          return undefined
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
