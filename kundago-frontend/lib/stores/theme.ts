import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Appearance } from 'react-native';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  loaded: boolean;
  setMode: (mode: ThemeMode) => void;
  setIsDark: (dark: boolean) => void;
  hydrate: () => Promise<void>;
}

const THEME_KEY = 'theme-mode';

const getDeviceIsDark = (): boolean => {
  try {
    return Appearance.getColorScheme() === 'dark';
  } catch {
    return false;
  }
};

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  isDark: getDeviceIsDark(),
  loaded: false,

  setMode: (mode) => {
    if (mode === 'light') {
      set({ mode, isDark: false });
    } else if (mode === 'dark') {
      set({ mode, isDark: true });
    } else {
      const deviceDark = getDeviceIsDark();
      set({ mode, isDark: deviceDark });
    }
    SecureStore.setItemAsync(THEME_KEY, mode);
  },

  setIsDark: (dark) => {
    set({ isDark: dark });
  },

  hydrate: async () => {
    try {
      const stored = await SecureStore.getItemAsync(THEME_KEY);
      if (stored === 'light') {
        set({ mode: stored, isDark: false, loaded: true });
      } else if (stored === 'dark') {
        set({ mode: stored, isDark: true, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },
}));
