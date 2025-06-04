
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import type declarations
import './types/capacitor.d.ts';

// Set up comprehensive Capacitor polyfill IMMEDIATELY
(function() {
  if (typeof window !== 'undefined') {
    // Ensure Capacitor object exists with all necessary methods
    if (!window.Capacitor) {
      window.Capacitor = {
        triggerEvent: function(eventName: string, target: string) {
          console.log('Polyfilled triggerEvent called:', eventName, target);
          // Do nothing - this prevents the error
        },
        platform: 'web',
        isNative: false,
        getPlatform: function() { return 'web'; },
        isNativePlatform: function() { return false; }
      };
    } else {
      // If Capacitor exists but triggerEvent doesn't, add it
      if (!window.Capacitor.triggerEvent) {
        window.Capacitor.triggerEvent = function(eventName: string, target: string) {
          console.log('Polyfilled triggerEvent called:', eventName, target);
        };
      }
    }
  }
})();

// Import Capacitor after polyfill is in place
import { Capacitor } from '@capacitor/core';

// Add mobile viewport meta tag if not present
if (!document.querySelector('meta[name="viewport"]')) {
  const meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
  document.getElementsByTagName('head')[0].appendChild(meta);
}

// Add error handler for Capacitor-related errors
window.addEventListener('error', (event) => {
  if (event.message.includes('triggerEvent') || event.message.includes('Capacitor')) {
    console.warn('Capacitor-related error caught and suppressed:', event.message);
    event.preventDefault();
    return false;
  }
});

// Initialize app after ensuring Capacitor is ready
const initializeApp = () => {
  console.log('Capacitor platform:', Capacitor.getPlatform());
  console.log('Capacitor is native app:', Capacitor.isNativePlatform());
  
  // Ensure the root element exists
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found');
    return;
  }

  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    console.log('React app initialized successfully');
  } catch (error) {
    console.error('Error initializing React app:', error);
  }
};

// Enhanced initialization logic with Capacitor readiness check
const startApp = () => {
  // Add a small delay to ensure Capacitor is fully loaded
  setTimeout(() => {
    try {
      console.log('Capacitor object available:', typeof Capacitor !== 'undefined');
      console.log('Running in native Capacitor environment:', Capacitor.isNativePlatform());
      initializeApp();
    } catch (error) {
      console.error('Error during Capacitor check:', error);
      // Fallback to initialize anyway
      initializeApp();
    }
  }, 200);
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
