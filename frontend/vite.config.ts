import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    // Only runs during `vite build` when SENTRY_AUTH_TOKEN is present.
    // Set SENTRY_AUTH_TOKEN in your CI environment (not in .env — it's a secret).
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
  },
});
