import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastProvider } from "@/lib/toast";
import { StripeProvider } from "@stripe/stripe-react-native";
import { ThemeProvider } from "@/components/ThemeProvider";
import "@/global.css";

export const unstable_settings = {
  anchor: '(auth)',
};

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}>
        <ThemeProvider>
          <ToastProvider>
            <Stack>
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
