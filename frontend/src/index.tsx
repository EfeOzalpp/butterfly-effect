import { createRoot } from 'react-dom/client';
import { initSentry } from './lib/sentry';
import { initPostHog } from './lib/posthog';
import AppShell from './app/main';

initSentry();
initPostHog();

const container = document.getElementById('butterfly-effect');
if (!container) {
  throw new Error('Missing #butterfly-effect root element');
}

createRoot(container).render(<AppShell />);
