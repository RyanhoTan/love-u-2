import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerTitle: "Love U"
        }}
      />
      <StatusBar style="auto" />
    </>
  );
}
