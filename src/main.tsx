
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
  
  // Ensure the root element exists
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  // Add a small delay to ensure React is fully loaded
  setTimeout(() => {
    try {
      createRoot(rootElement).render(
        <StrictMode>
          <App />
        </StrictMode>,
      );
    } catch (error) {
      console.error('Error initializing React app:', error);
    }
  }, 100);
};

// Enhanced initialization logic
const startApp = () => {
  // Check if we're in a Capacitor environment
  if (Capacitor.isNativePlatform()) {
    console.log('Running in native Capacitor environment');
    // Wait for device ready event
    document.addEventListener('deviceready', initializeApp, false);
    
    // Fallback timeout in case deviceready doesn't fire
    setTimeout(() => {
      console.log('Fallback: deviceready timeout, initializing anyway');
      initializeApp();
    }, 5000);
  } else {
    console.log('Running in web browser');
    // For web, initialize immediately
    initializeApp();
  }
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
