import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.crossbridge.app',
  appName: 'CrossBridge',
  webDir: 'dist',
  server: {
    // 开发时可指向本地 server，生产为同域
    // androidScheme: 'https'
  },
  plugins: {
    // 后续可加 Filesystem、App、Browser 等
  }
};

export default config;
