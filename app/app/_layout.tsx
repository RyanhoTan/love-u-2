import { Slot } from "expo-router";
import { ToastProvider } from "@/components/common/toast";
import { AuthProvider } from "@/app/features/auth/auth-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
      <ToastProvider />
    </AuthProvider>
  );
}
