// TODO: Thoroughly test log outs on mobile and desktop
// TODO: Add confirm dialog to log out

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NavigationPaths } from '../constants/shared.constants';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/app.store';
import { api } from '../client/api-client';

interface UseLogOutOptions {
  onSuccess?: () => void;
}

export const useLogOut = (options: UseLogOutOptions = {}) => {
  const { setIsLoggedIn, setIsNavSheetOpen, setInviteToken } = useAppStore();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const result = useMutation({
    mutationFn: api.logOut,
    onSuccess: async () => {
      await navigate(NavigationPaths.Home);
      options.onSuccess?.();
      setIsNavSheetOpen(false);
      setIsLoggedIn(false);
      setInviteToken(null);
      queryClient.clear();
    },
  });

  return result;
};
