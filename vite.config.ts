import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    plugins: [react()],

    /**
     * Environment variables
     * Cleaner & safer way
     */
    define: {
      'process.env': {
        GEMINI_API_KEY: env.GEMINI_API_KEY,
      },
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    /**
     * Build optimizations
     */
    build: {
      chunkSizeWarningLimit: 1600,

      rollupOptions: {
        output: {
          /**
           * Manual chunk splitting
           * Improves loading performance significantly
           */
          manualChunks: {
            // React core
            react: ['react', 'react-dom'],

            // Wallets & Web3
            wallets: [
              '@rainbow-me/rainbowkit',
            ],

            // EVM core
            evm: ['viem', 'wagmi'],
          },
        },
      },
    },
  };
});
