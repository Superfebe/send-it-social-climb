
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.senditsocialclimb.app',
  appName: 'send-it-social-climb',
  webDir: 'dist',
  server: {
    url: "https://48a5a346-1aa4-41d0-a799-bd8df13cb5cb.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#3B82F6",
      androidScaleType: "CENTER_CROP",
      showSpinner: false
    }
  }
};

export default config;
