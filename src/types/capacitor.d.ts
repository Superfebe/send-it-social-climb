
// Type declarations for Capacitor on window object
declare global {
  interface Window {
    Capacitor?: {
      triggerEvent?: (eventName: string, target: string) => void;
      [key: string]: any;
    };
  }
}

export {};
