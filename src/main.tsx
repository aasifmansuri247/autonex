import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { Capacitor } from '@capacitor/core';
import App from './App.tsx';
import './index.css';

// Prevent crash in native Android APK:
// In Capacitor native WebView, registering service workers attempts to intercept
// local assets schemes (capacitor:// or https://localhost), causing Android WebView crashes (~3-5s after launch).
// We strictly only register the Service Worker when running in a standard web browser.
const isNative = Capacitor.isNativePlatform();
if (!isNative && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    registerSW({ immediate: true });
  } catch (err) {
    console.warn('PWA service worker registration skipped:', err);
  }
}

// Global safety net for unhandled errors
window.addEventListener('error', (event) => {
  console.warn('Caught window error:', event.message || event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.warn('Caught unhandled rejection:', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
