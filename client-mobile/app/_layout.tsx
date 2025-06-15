import { Stack, useRouter, Slot } from "expo-router";
import { useEffect } from "react";
import { ThemeProvider } from "../contexts/ThemeContext";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Change la route ici selon ce que tu veux tester :
      router.replace("/(auth)/login");
      // router.replace("/workspace");
      // router.replace("/settings");
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
