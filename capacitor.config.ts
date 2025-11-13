import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dreamlytics.app',
  appName: 'Dreamlytics',
  webDir: '.output/public',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    // For development: Allow loading from localhost
    // Comment out or remove for production builds
    hostname: 'localhost',
    cleartext: true, // Allow HTTP in development
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#8a2be2',
      showSpinner: false,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#8a2be2'
    },
    // WebView configuration for better performance
    CapacitorHttp: {
      enabled: true,
    }
  },
  // iOS specific configuration
  ios: {
    contentInset: 'always',
    scrollEnabled: true,
    allowsLinkPreview: false,
  },
  // Android specific configuration
  android: {
    allowMixedContent: true, // For development only
    captureInput: true,
    webContentsDebuggingEnabled: true, // For development only
  }
};

export default config;
