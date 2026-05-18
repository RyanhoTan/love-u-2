import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/app/features/auth/auth-context";

export default function HomeLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* <Stack.Screen name="(tabs)" />
      <Stack.Screen name="status/index" /> */}
    </Stack>
  );
}
