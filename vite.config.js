import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';
import mkcert from 'vite-plugin-mkcert';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mkcert(),
    visualizer({
      filename: 'dist/stats.html',
      open: true, // Opens the report in browser after build
      gzipSize: true,
      brotliSize: true,
    }),
    compression({ algorithm: 'brotliCompress' }),
  ],
  server: {
    https: true, // mkcert is usually used to enable HTTPS locally
  },
})
