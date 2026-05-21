import { Slot } from "expo-router";
import { ToastProvider } from "@/components/common/toast";
import { AuthProvider } from "@/app/features/auth/auth-context";
import { ActionSheetProvider } from "@expo/react-native-action-sheet"; // 1. 引入 ActionSheetProvider

export default function RootLayout() {
  return (
    <AuthProvider>
      <ActionSheetProvider>
        <Slot />
      </ActionSheetProvider>
      <ToastProvider />
    </AuthProvider>
  );
}
