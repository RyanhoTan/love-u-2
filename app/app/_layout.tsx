import { Slot } from "expo-router";
import { ToastProvider } from "@/components/common/toast";
import { AuthProvider } from "@/app/features/auth/auth-context";
import { ActionSheetProvider } from "@expo/react-native-action-sheet"; // 1. 引入 ActionSheetProvider
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
