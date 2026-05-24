import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

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

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  isDark: false,
  loaded: false,

  setMode: (mode) => {
    set({ mode });
    SecureStore.setItemAsync(THEME_KEY, mode);
  },

  setIsDark: (dark) => {
    set({ isDark: dark });
  },

  hydrate: async () => {
    try {
      const stored = await SecureStore.getItemAsync(THEME_KEY);
      if (stored === 'light' || stored === 'dark') {
        set({ mode: stored, loaded: true });
      } else {
        set({ loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },
}));
