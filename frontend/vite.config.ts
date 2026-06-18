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
  },
  css: {
    devSourcemap: true,
  },
  build: {
    target: 'es2020',
    sourcemap: true,
    chunkSizeWarningLimit: 500,
    modulePreload: {
      // three-* chunks are only needed when the graph renders (lazy dynamic import).
      // Without this filter, manualChunks causes rolldown to promote them into the
      // static chunk graph, adding ~964 kB of THREE.js to the eager modulepreload
      // and blocking the initial paint with unnecessary parse work.
      resolveDependencies: (_filename, deps) =>
        deps.filter(dep => !/three-(core|module|vendor)/.test(dep)),
    },
    rolldownOptions: {
      output: {
        manualChunks(id) {
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
