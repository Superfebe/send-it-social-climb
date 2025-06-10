
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import type declarations
import './types/capacitor.d.ts';

// Enhanced Capacitor polyfill for better compatibility
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

// Initialize app with better environment detection
const initializeApp = () => {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  
  console.log('Capacitor platform:', platform);
  console.log('Capacitor is native app:', isNative);
  console.log('Environment:', process.env.NODE_ENV || 'production');
  
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
    
    // Log additional info for debugging
    if (isNative) {
      console.log('Running in native Capacitor app');
    } else {
      console.log('Running in web browser');
    }
  } catch (error) {
    console.error('Error initializing React app:', error);
  }
};

// Enhanced initialization with better readiness detection
const startApp = () => {
  // For native apps, wait for deviceready event
  if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
    document.addEventListener('deviceready', () => {
      console.log('Capacitor device ready event fired');
      initializeApp();
    }, false);
    
    // Fallback timeout in case deviceready doesn't fire
    setTimeout(() => {
      console.log('Fallback initialization after timeout');
      initializeApp();
    }, 3000);
  } else {
    // For web, start immediately with a small delay
    setTimeout(() => {
      try {
        console.log('Capacitor object available:', typeof Capacitor !== 'undefined');
        initializeApp();
      } catch (error) {
        console.error('Error during Capacitor check:', error);
        // Fallback to initialize anyway
        initializeApp();
      }
    }, 100);
  }
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
