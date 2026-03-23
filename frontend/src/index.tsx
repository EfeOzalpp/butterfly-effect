import { createRoot } from 'react-dom/client';
import AppShell from './app/main';

const container = document.getElementById('butterfly-effect')!;
createRoot(container).render(<AppShell />);
