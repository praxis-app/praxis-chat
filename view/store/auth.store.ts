// TODO: Clean up auth state management

import { create } from 'zustand';
import { LocalStorageKeys } from '../constants/shared.constants';

interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  inviteToken: string | null;
  setAccessToken(accessToken: string | null): void;
  setIsLoggedIn(isLoggedIn: boolean): void;
  setInviteToken(inviteToken: string | null): void;
}

export const useAuthSore = create<AuthState>((set) => ({
  isLoggedIn: false,
  accessToken: localStorage.getItem(LocalStorageKeys.AccessToken),
  inviteToken: localStorage.getItem(LocalStorageKeys.InviteToken),

  setAccessToken(accessToken) {
    set({ accessToken });
  },
  setIsLoggedIn(isLoggedIn) {
    set({ isLoggedIn });
  },
  setInviteToken(inviteToken) {
    set({ inviteToken });
  },
}));
