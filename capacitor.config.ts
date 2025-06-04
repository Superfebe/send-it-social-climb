
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.senditsocialclimb.app',
  appName: 'send-it-social-climb',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ff4500",
      androidScaleType: "CENTER_CROP",
      showSpinner: false
    }
  }
};

export default config;
