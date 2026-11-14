import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    fs: {
      allow: ['..'],
    },
    port: 5173,
    host: true,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
  },
});
