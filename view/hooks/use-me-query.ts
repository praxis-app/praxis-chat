// TODO: Prevent excessive calls to `/api/users/me` when the user is not logged in

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { api } from '../client/api-client';
import { LocalStorageKeys } from '../constants/shared.constants';
import { useAppStore } from '../store/app.store';
import { CurrentUser } from '../types/user.types';

export const useMeQuery = (
  options?: Omit<UseQueryOptions<{ user: CurrentUser }>, 'queryKey'>,
) => {
  const { setIsAppLoading, setIsLoggedIn } = useAppStore();

  const defaultOptions = {
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  };

  const result = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const me = await api.getCurrentUser();
        setIsLoggedIn(true);

        let profilePicture: CurrentUser['profilePicture'] = null;
        if (me.user.profilePicture) {
          const result = await api.getUserImage(
            me.user.id,
            me.user.profilePicture.id,
          );
          profilePicture = {
            ...me.user.profilePicture,
            url: URL.createObjectURL(result),
          };
        }

        return {
          user: {
            ...me.user,
            profilePicture,
          },
        };
      } catch (error) {
        if ((error as AxiosError).response?.status === 401) {
          localStorage.removeItem(LocalStorageKeys.AccessToken);
          setIsLoggedIn(false);
        }
        throw error;
      } finally {
        setIsAppLoading(false);
      }
    },
    ...defaultOptions,
    ...options,
  });

  return result;
};
