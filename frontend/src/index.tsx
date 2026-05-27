import { createRoot } from 'react-dom/client';
import AppShell from './app/main';
import { initPostHog } from './lib/posthog';

const container = document.getElementById('butterfly-effect');
if (!container) {
  throw new Error('Missing #butterfly-effect root element');
}

createRoot(container).render(<AppShell />);

void import('./lib/sentry').then(({ initSentry }) => {
  initSentry();
}).catch((error: unknown) => {
  console.warn('[sentry] init import failed:', error);
});

void initPostHog();
