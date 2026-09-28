import { ExpoConfig, ConfigContext } from "expo/config";
import BRAND from "../brand.json";

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    icon: "./assets/images/icon.png",
    splash: {
      image: "./assets/images/splash.png",
      backgroundColor: "#ffffff",
    },
    name: BRAND.displayName,
    slug: BRAND.mobile.slug,
    version: "1.0.0",
    scheme: BRAND.mobile.scheme,
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    plugins: [
      "expo-router",
      "expo-notifications",
      "expo-video",
      [
        "expo-location",
        {
          locationAlwaysPermission:
            "我们需要您的定位权限以获取您的位置。",
          locationWhenInUsePermission:
            "我们需要您的定位权限以获取您的位置。",
        },
      ],
    ],
    android: {
      package: BRAND.mobile.androidPackage,
      permissions: [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "POST_NOTIFICATIONS",
      ],
    },
    ios: {
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "我们需要您的定位权限以获取您的位置。",
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
