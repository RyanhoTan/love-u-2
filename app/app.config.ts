import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    icon: './assets/images/icon.png',
    splash: {
      image: './assets/images/splash.png',
      backgroundColor: '#ffffff',
    },
    name: 'love4u',
    slug: 'love-u-mobile',
    version: '1.0.0',
    scheme: 'loveumobile',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    plugins: ['expo-router'],
    android: {
      package: 'com.loveumobile.app',
    },
    web: {
      bundler: 'metro',
    },
    experiments: {
      typedRoutes: true,
    },
  };
};
