import type { CapacitorConfig } from '@capacitor/cli';
import { CAPACITOR_SERVER_URL } from './capacitor.server';

const serverUrl = CAPACITOR_SERVER_URL.trim();

const config: CapacitorConfig = {
  appId: 'kr.co.payking.web',
  appName: '페이킹 플러스 Web',
  webDir: 'dist',
  ...(serverUrl && {
    server: {
      url: serverUrl,
      cleartext: serverUrl.startsWith('http://'),
      androidScheme: 'https',
    },
  }),
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 500,
      launchFadeOutDuration: 200,
      backgroundColor: '#FFFFFF',
      showSpinner: false,
    },
  },
};

export default config;
