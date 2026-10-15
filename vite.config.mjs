import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Cloudflare Pages serves from domain root ('/').
// GitHub Pages repository subpath defaults to '/maxeco/'.
const isCloudflarePages = process.env.CF_PAGES === '1' || process.env.CLOUDFLARE_PAGES === '1';
const baseUrl = process.env.VITE_BASE_URL || (isCloudflarePages ? '/' : '/maxeco/');

export default defineConfig({
  plugins: [react()],
  base: baseUrl,
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  server: {
    port: 3000,
    open: true
  }
});
