import { init, browserTracingIntegration, addIntegration } from "@sentry/react";

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn || !import.meta.env.PROD) return;

  init({
    dsn,
    integrations: [browserTracingIntegration()],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });

  // Loaded separately so the replay bundle (and its legacy polyfills) is its own
  // async chunk and doesn't inflate the main Sentry chunk.
  void import("./sentry-replay").then(({ replayIntegration }) => {
    addIntegration(replayIntegration());
  });
}

export { captureException } from "@sentry/react";
