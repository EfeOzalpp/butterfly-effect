import { createRoot } from 'react-dom/client';
import AppShell from './app/main';

const container = document.getElementById('butterfly-effect');
if (!container) {
  throw new Error('Missing #butterfly-effect root element');
}

createRoot(container).render(<AppShell />);
