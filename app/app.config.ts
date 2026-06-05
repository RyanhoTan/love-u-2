import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    icon: "./assets/images/icon.png",
    splash: {
      image: "./assets/images/splash.png",
      backgroundColor: "#ffffff",
    },
    name: "love4u",
    slug: "love-u-mobile",
    version: "1.0.0",
    scheme: "loveumobile",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysPermission:
            "我们需要您的定位权限以获取周边美食和景点。",
          locationWhenInUsePermission:
            "我们需要您的定位权限以获取周边美食和景点。",
        },
      ],
    ],
    android: {
      package: "com.loveumobile.app",
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
    },
    ios: {
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "我们需要您的定位权限以获取周边美食和景点。",
      },
    },
    web: {
      bundler: "metro",
    },
    experiments: {
      typedRoutes: true,
    },
  };
};
