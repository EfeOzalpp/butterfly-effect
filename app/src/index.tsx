import { createRoot, hydrateRoot } from 'react-dom/client';
import AppShell from './app/main';
import { initPostHog } from './lib/posthog';

const container = document.getElementById('butterfly-effect');
if (!container) {
  throw new Error('Missing #butterfly-effect root element');
}

// SSR sends HTML inside #butterfly-effect. When that markup exists,
// hydrate so React reuses the DOM instead of recreating it from an empty root.
if (container.hasChildNodes()) {
  hydrateRoot(container, <AppShell />);
} else {
  createRoot(container).render(<AppShell />);
}

void import('./lib/sentry').then(({ initSentry }) => {
  initSentry();
}).catch((error: unknown) => {
  console.warn('[sentry] init import failed:', error);
});

void initPostHog();
