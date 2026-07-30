import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  Outfit_300Light, Outfit_400Regular, Outfit_500Medium,
  Outfit_600SemiBold, Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import { Inter_400Regular, Inter_500Medium } from "@expo-google-fonts/inter";
import { getToken } from "../src/api/client";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* already hidden — harmless on fast reloads */
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Mobile networks drop constantly; refetching on reconnect keeps screens
      // honest without hammering the API on every focus change.
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

/** Redirects to /login when there is no stored session, and away from it once there is. */
function useAuthGate(ready: boolean) {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    getToken().then((t) => {
      if (!alive) return;
      setAuthed(!!t);
      setChecked(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!checked || !ready) return;
    const onAuthScreen = segments[0] === "login";
    if (!authed && !onAuthScreen) router.replace("/login");
    else if (authed && onAuthScreen) router.replace("/");
  }, [checked, ready, authed, segments, router]);

  return checked;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_300Light, Outfit_400Regular, Outfit_500Medium,
    Outfit_600SemiBold, Outfit_700Bold,
    Inter_400Regular, Inter_500Medium,
  });

  // A missing font must not block the app — better an unstyled screen than a
  // permanent splash.
  const ready = fontsLoaded || !!fontError;
  const authChecked = useAuthGate(ready);

  useEffect(() => {
    if (ready && authChecked) SplashScreen.hideAsync().catch(() => {});
  }, [ready, authChecked]);

  if (!ready || !authChecked) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            contentStyle: { backgroundColor: "#FFFFFF" },
          }}
        />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
