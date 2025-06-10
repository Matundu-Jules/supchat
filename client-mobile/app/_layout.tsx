import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/(auth)/login");
    }, 0); // laisse le temps à la navigation de s'initialiser

    return () => clearTimeout(timeout);
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
