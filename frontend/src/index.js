// src/index.js
import App from './app/App';
import { createRoot } from 'react-dom/client'; // Import the createRoot method
import './assets/fonts/fonts1.css';

// Create a root for React 18
const root = createRoot(document.getElementById('butterfly-effect'));

// Render the App component
root.render(
    <App />
);
