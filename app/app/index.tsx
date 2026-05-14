import { useState } from "react";
import { Redirect } from "expo-router";

export default function HomeScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (
    <>{isLoggedIn ? <Redirect href="/home" /> : <Redirect href="/auth" />}</>
  );
}
