
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import App from './App.tsx';
import './index.css';

// Add mobile viewport meta tag if not present
if (!document.querySelector('meta[name="viewport"]')) {
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
  document.getElementsByTagName('head')[0].appendChild(meta);
}

// Initialize app after Capacitor is ready
const initializeApp = () => {
  console.log('Capacitor platform:', Capacitor.getPlatform());
  console.log('Capacitor is native app:', Capacitor.isNativePlatform());
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
};

// Check if we're in a Capacitor environment
if (Capacitor.isNativePlatform()) {
  // Wait for device ready event
  document.addEventListener('deviceready', initializeApp, false);
} else {
  // For web, initialize immediately
  initializeApp();
}
