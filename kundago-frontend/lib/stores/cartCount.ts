import { create } from 'zustand';

interface CartCountState {
  count: number;
  setCount: (n: number) => void;
}

export const useCartCount = create<CartCountState>((set) => ({
  count: 0,
  setCount: (n) => set({ count: n }),
}));
