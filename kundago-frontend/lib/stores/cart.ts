import { create } from 'zustand';

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type CartState = {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  itemCount: 0,
  total: 0,
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId);
      const items = existing
        ? state.items.map((i) =>
            i.productId === item.productId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i,
          )
        : [...state.items, item];
      return {
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      };
    }),
  removeItem: (productId) =>
    set((state) => {
      const items = state.items.filter((i) => i.productId !== productId);
      return {
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      };
    }),
  updateQuantity: (productId, quantity) =>
    set((state) => {
      const items = quantity <= 0
        ? state.items.filter((i) => i.productId !== productId)
        : state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          );
      return {
        items,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      };
    }),
  clearCart: () => set({ items: [], itemCount: 0, total: 0 }),
  setItems: (items) =>
    set({
      items,
      itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
}));
