import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    // Only runs during `vite build` when SENTRY_AUTH_TOKEN is present.
    // Set SENTRY_AUTH_TOKEN in your CI environment (not in .env; it is a secret).
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: !process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  server: {
    host: true,
    proxy: {
      '/api': 'http://127.0.0.1:3000',
    },
  },
  css: {
    devSourcemap: true,
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    manifest: true, // build file includes filenames for CSS/JS for SSR.
    chunkSizeWarningLimit: 500,
    modulePreload: {
      // three-* chunks are only needed when the graph renders (lazy dynamic import).
      resolveDependencies: (_filename, deps) =>
        deps.filter(dep => !/three-(core|module|vendor)/.test(dep)),
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React must stay out of three-vendor to prevent duplicate instances causing hydration errors.
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
            return undefined;
          }
          if (id.includes('node_modules/three/build/three.core.js')) {
            return 'three-core';
          }
          if (id.includes('node_modules/three/build/')) {
            return 'three-module';
          }
          if (id.includes('node_modules/three/') || id.includes('node_modules/@react-three/')) {
            return 'three-vendor';
          }
        },
      },
    },
  },
});
