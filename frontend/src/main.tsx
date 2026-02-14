import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initErrorTracking } from './lib/errorTracking';

// Initialize error tracking (Sentry if configured)
initErrorTracking().catch((error) => {
  console.warn('Failed to initialize error tracking:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .catch(() => {
        // Silent fail in case SW cannot be registered
      });
  });
}
