import { Redirect } from "expo-router";
import { useAuth } from "@/app/features/auth/auth-context";

export default function HomeScreen() {
  const { isAuthenticated, isRestoring } = useAuth();

  if (isRestoring) {
    return null;
  }

  return <Redirect href={isAuthenticated ? "/home" : "/auth"} />;
}
