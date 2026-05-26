import { useThemeStore } from '@/lib/stores/theme';

export const Colors = {
  primary: {
    DEFAULT: '#006e2f',
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ae176',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#145231',
    950: '#0c2818',
    container: '#22c55e',
  },
  secondary: {
    DEFAULT: '#565e74',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  surface: {
    DEFAULT: '#f7f9fb',
    dim: '#d8dadc',
    bright: '#f7f9fb',
    containerLowest: '#ffffff',
    containerLow: '#f2f4f6',
    container: '#eceef0',
    containerHigh: '#e6e8ea',
    containerHighest: '#e0e3e5',
  },
  onSurface: '#191c1e',
  onSurfaceVariant: '#3d4a3d',
  error: {
    DEFAULT: '#ba1a1a',
    container: '#ffdad6',
  },
  outline: '#6d7b6c',
  inverseSurface: '#2d3133',
  inverseOnSurface: '#eff1f3',
  inversePrimary: '#4ae176',
  background: '#f7f9fb',
  onBackground: '#191c1e',
  surfaceVariant: '#e0e3e5',
};

export const DarkColors = {
  primary: {
    DEFAULT: '#006e2f',
    50: '#0c2818',
    100: '#145231',
    200: '#166534',
    300: '#15803d',
    400: '#16a34a',
    500: '#22c55e',
    600: '#4ae176',
    700: '#86efac',
    800: '#bbf7d0',
    900: '#dcfce7',
    950: '#f0fdf4',
    container: '#15803d',
  },
  secondary: {
    DEFAULT: '#dae2fd',
    50: '#020617',
    100: '#0f172a',
    200: '#1e293b',
    300: '#334155',
    400: '#475569',
    500: '#64748b',
    600: '#94a3b8',
    700: '#cbd5e1',
    800: '#e2e8f0',
    900: '#f1f5f9',
  },
  surface: {
    DEFAULT: '#121415',
    dim: '#0b0d0e',
    bright: '#3b3d3e',
    containerLowest: '#0c0e0f',
    containerLow: '#1a1c1e',
    container: '#1e2022',
    containerHigh: '#282a2c',
    containerHighest: '#333537',
  },
  onSurface: '#ffffff',
  onSurfaceVariant: '#bcc9bc',
  error: {
    DEFAULT: '#ffb4ab',
    container: '#93000a',
  },
  outline: '#869486',
  inverseSurface: '#e1e3e5',
  inverseOnSurface: '#2d3133',
  inversePrimary: '#006e2f',
  background: '#121415',
  onBackground: '#e1e3e5',
  surfaceVariant: '#3d403d',
};

export function useThemeColors() {
  const isDark = useThemeStore((s) => s.isDark);
  return isDark ? DarkColors : Colors;
}

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  marginMobile: 16,
};

export const BorderRadius = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
};

export const Typography = {
  displayLg: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '800',
  },
  displayLgMobile: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
  },
  headlineMd: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  bodyLg: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
  },
  bodyMd: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  labelSm: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
};

export const Fonts = {
  display: 'System',
  headline: 'System',
  body: 'System',
  label: 'System',
};

export const Shadows = {
  ambient: {
    shadowColor: 'rgba(15, 23, 42, 0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  sm: {
    shadowColor: 'rgba(15, 23, 42, 0.08)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 1,
  },
};
