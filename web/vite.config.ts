// vite.config.ts

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement
  const env = loadEnv(mode, process.cwd(), ''); // URL du serveur backend - utilise le service Docker 'api' si disponible
  const backendUrl =
    process.env.NODE_ENV === 'development' && process.env.DOCKER_ENV
      ? 'http://api:3000'
      : env.VITE_BACKEND_URL || 'http://127.0.0.1:3000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@store': path.resolve(__dirname, 'src/store'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@styles': path.resolve(__dirname, 'src/styles'),
        '@utils': path.resolve(__dirname, 'src/utils'),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
        },
      },
    },
    server: {
      watch: {
        usePolling: true,
        ignored: ['!**/*.scss'],
      },
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Embedder-Policy': 'credentialless',
      },
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
