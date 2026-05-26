import { View } from 'react-native';
import { useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useThemeStore } from '@/lib/stores/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceScheme = useDeviceColorScheme();
  const mode = useThemeStore((s) => s.mode);
  const setIsDark = useThemeStore((s) => s.setIsDark);
  const hydrate = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    const resolved =
      mode === 'system'
        ? deviceScheme === 'dark'
        : mode === 'dark';
    setIsDark(resolved);
  }, [mode, deviceScheme]);

  const isDark = mode === 'system'
    ? deviceScheme === 'dark'
    : mode === 'dark';

  return (
    <View className={`flex-1 will-change-variable ${isDark ? 'dark' : ''}`} style={{ flex: 1 }}>
      {children}
    </View>
  );
}
