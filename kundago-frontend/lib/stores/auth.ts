import { create } from 'zustand';

type User = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
};

type AuthState = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => set({ token, user }),
  setUser: (user) => set({ user }),
  logout: () => set({ token: null, user: null }),
}));
