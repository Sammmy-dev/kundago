import { View } from 'react-native';
import { useEffect } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useThemeStore } from '@/lib/stores/theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceScheme = useDeviceColorScheme();
  const mode = useThemeStore((s) => s.mode);
  const isDark = useThemeStore((s) => s.isDark);
  const setIsDark = useThemeStore((s) => s.setIsDark);
  const hydrate = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, []);

  // When mode is 'system', track device scheme changes
  useEffect(() => {
    if (mode === 'system') {
      setIsDark(deviceScheme === 'dark');
    }
  }, [mode, deviceScheme, setIsDark]);

  return (
    <View key={isDark ? 'dark' : 'light'} className={`flex-1 will-change-variable ${isDark ? 'dark' : ''}`} style={{ flex: 1 }}>
      {children}
    </View>
  );
}
