// TODO: Add confirm dialog to log out

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NavigationPaths } from '../constants/shared.constants';
import { useNavigate } from 'react-router-dom';
import { useAuthSore } from '../store/auth.store';
import { api } from '../client/api-client';

interface UseLogOutOptions {
  onSuccess?: () => void;
}

export const useLogOut = (options: UseLogOutOptions = {}) => {
  const { setIsLoggedIn, setIsNavSheetOpen, setAccessToken, setInviteToken } =
    useAuthSore();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const result = useMutation({
    mutationFn: api.logOut,
    onSuccess: async () => {
      await navigate(NavigationPaths.Home);
      options.onSuccess?.();
      setIsNavSheetOpen(false);
      setIsLoggedIn(false);
      setAccessToken(null);
      setInviteToken(null);
      queryClient.clear();
    },
  });

  return result;
};
