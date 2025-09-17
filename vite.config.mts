import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import * as dotenv from 'dotenv';
import path from 'path';
import { defineConfig } from 'vite';

dotenv.config();

// https://vitejs.dev/config
export default defineConfig(async () => {
  return {
    root: 'view',
    envDir: '../',
    server: {
      port: parseInt(process.env.CLIENT_PORT || '3000'),
      proxy: {
        '/api': {
          target: `http://localhost:${process.env.VITE_SERVER_PORT}/api`,
          rewrite: (path: string) => path.replace(/^\/api/, ''),
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './view'),
        '@common': path.resolve(__dirname, './common'),
      },
    },
    cacheDir: '../node_modules/.vite',
    build: {
      outDir: '../dist/view',
    },
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./test/test-setup.ts'],
      globals: true,
    },
  };
});
