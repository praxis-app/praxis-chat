/**
 * TODO: Split into multiple stores for auth and navigation
 *
 * TODO: Clean up auth state management - acces token should not need to be tracked
 * in the store. If anything there should be a `canAuth` flag or something similar.
 */

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
  isNavSheetOpen: false,
  isAppLoading: !!localStorage.getItem(LocalStorageKeys.AccessToken),
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
