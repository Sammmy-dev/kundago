import { create } from 'zustand';

type UiState = {
  isSearchFocused: boolean;
  setSearchFocused: (focused: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isSearchFocused: false,
  setSearchFocused: (focused) => set({ isSearchFocused: focused }),
}));
