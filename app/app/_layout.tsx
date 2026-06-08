import { Slot } from "expo-router";
import * as Notifications from "expo-notifications";
import { ToastProvider } from "@/components/common/toast";
import { AuthProvider } from "@/app/features/auth/auth-context";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ActionSheetProvider useCustomActionSheet>
          <Slot />
        </ActionSheetProvider>
        <ToastProvider />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
