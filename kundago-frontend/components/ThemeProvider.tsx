import { View } from 'react-native';
import { useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useThemeStore } from '@/lib/stores/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceScheme = useDeviceColorScheme();
  const { mode, isDark, setIsDark, hydrate } = useThemeStore();

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

  return (
    <View className={`flex-1 ${isDark ? 'dark' : ''}`} style={{ flex: 1 }}>
      {children}
    </View>
  );
}
