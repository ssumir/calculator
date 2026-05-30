import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.mariocalculator.myapp',
  appName: 'Mario Calculator',
  webDir: 'dist',
  android: {
    buildOptions: {
      keystorePath: 'android.keystore',
      keystorePassword: 'Saiful@1985',
      keystoreAlias: 'android',
      keystoreAliasPassword: 'Saiful@1985',
    }
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;