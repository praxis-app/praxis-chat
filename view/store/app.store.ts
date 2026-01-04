// TODO: Split into multiple stores for auth and navigation

import { create } from 'zustand';
import { LocalStorageKeys } from '../constants/shared.constants';

interface AppState {
  isLoggedIn: boolean;
  isAppLoading: boolean;
  accessToken: string | null;
  inviteToken: string | null;
  isNavSheetOpen: boolean;
  setAccessToken(accessToken: string | null): void;
  setIsLoggedIn(isLoggedIn: boolean): void;
  setIsAppLoading(isAppLoading: boolean): void;
  setInviteToken(inviteToken: string | null): void;
  setIsNavSheetOpen(isNavSheetOpen: boolean): void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoggedIn: false,
  isAppLoading: true,
  isNavSheetOpen: false,
  accessToken: localStorage.getItem(LocalStorageKeys.AccessToken),
  inviteToken: localStorage.getItem(LocalStorageKeys.InviteToken),

  setIsAppLoading(isAppLoading) {
    set({ isAppLoading });
  },
  setAccessToken(accessToken) {
    set({ accessToken });
  },
  setIsLoggedIn(isLoggedIn) {
    set({ isLoggedIn });
  },
  setInviteToken(inviteToken) {
    set({ inviteToken });
  },
  setIsNavSheetOpen(isNavSheetOpen) {
    set({ isNavSheetOpen });
  },
}));
