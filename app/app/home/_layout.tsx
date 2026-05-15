import { Stack } from "expo-router";
import { ToastProvider } from "@/components/common/toast";

export default function HomeLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* <Stack.Screen name="(tabs)" />
      <Stack.Screen name="status/index" /> */}
      </Stack>
      <ToastProvider />
    </>
  );
}
