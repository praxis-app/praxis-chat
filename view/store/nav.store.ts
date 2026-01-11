import { create } from 'zustand';

interface NavigationState {
  isNavSheetOpen: boolean;
  setIsNavSheetOpen(isNavSheetOpen: boolean): void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  isNavSheetOpen: false,

  setIsNavSheetOpen(isNavSheetOpen) {
    set({ isNavSheetOpen });
  },
}));
