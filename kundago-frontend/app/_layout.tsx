import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { setBackgroundColorAsync } from "expo-system-ui";
import { ToastProvider } from "@/lib/toast";
import { StripeProvider } from "@stripe/stripe-react-native";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Colors, DarkColors } from "@/constants/theme";
import { useThemeStore } from "@/lib/stores/theme";
import "@/global.css";

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());
  const isDark = useThemeStore((s) => s.isDark);
  const c = isDark ? DarkColors : Colors;

  useEffect(() => {
    if (Platform.OS === 'android') {
      setBackgroundColorAsync(c.surface.DEFAULT);
    }
  }, [isDark]);

  return (
    <QueryClientProvider client={queryClient}>
      <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}>
        <ThemeProvider>
          <ToastProvider>
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: c.surface.DEFAULT },
              }}
            >
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="product/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="search" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="order/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="addresses" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="checkout" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="settings" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="about" options={{ headerShown: false, animation: 'slide_from_right' }} />
              <Stack.Screen name="help" options={{ headerShown: false, animation: 'slide_from_right' }} />
            </Stack>
          </ToastProvider>
        </ThemeProvider>
      </StripeProvider>
    </QueryClientProvider>
  );
}
