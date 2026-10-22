import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);

  return {
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.NEXT_PUBLIC_DEMO_MODE': JSON.stringify(env.NEXT_PUBLIC_DEMO_MODE || env.VITE_DEMO_MODE || 'false'),
      'process.env.NEXT_PUBLIC_APP_URL': JSON.stringify(env.NEXT_PUBLIC_APP_URL || env.VITE_APP_URL || ''),
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist/client',
      emptyOutDir: true,
    },
  };
});
