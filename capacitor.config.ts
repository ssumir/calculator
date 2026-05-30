import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mariocalculator.myapp',
  appName: 'Mario Calculator',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;