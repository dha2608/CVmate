import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Unregister existing service workers to prevent stale cached index/chunks
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((r) => r.unregister())))
      .catch(() => {
        // Silent fail
      });

    // Best-effort cleanup of old app caches
    if ('caches' in window) {
      caches
        .keys()
        .then((keys) => Promise.all(keys.filter((k) => k.startsWith('cvmate-cache')).map((k) => caches.delete(k))))
        .catch(() => {
          // Silent fail
        });
    }
  });
}
