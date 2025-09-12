// TODO: Split into multiple stores for auth and navigation

import { create } from 'zustand';
import { LocalStorageKeys } from '../constants/shared.constants';

interface AppState {
  isLoggedIn: boolean;
  isAppLoading: boolean;
  inviteToken: string | null;
  isNavSheetOpen: boolean;
  setIsLoggedIn(isLoggedIn: boolean): void;
  setIsAppLoading(isAppLoading: boolean): void;
  setInviteToken(inviteToken: string | null): void;
  setIsNavSheetOpen(isNavSheetOpen: boolean): void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoggedIn: false,
  isAppLoading: true,
  isNavSheetOpen: false,
  inviteToken: localStorage.getItem(LocalStorageKeys.InviteToken),

  setIsAppLoading(isAppLoading) {
    set({ isAppLoading });
  },
  setInviteToken(inviteToken) {
    set({ inviteToken });
  },
  setIsLoggedIn(isLoggedIn) {
    set({ isLoggedIn });
  },
  setIsNavSheetOpen(isNavSheetOpen) {
    set({ isNavSheetOpen });
  },
}));
