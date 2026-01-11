import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { api } from '../client/api-client';
import { LocalStorageKeys } from '../constants/shared.constants';
import { useAuthSore } from '../store/auth.store';
import { CurrentUser } from '../types/user.types';

type UseMeQueryOptions = Omit<
  UseQueryOptions<{ user: CurrentUser }>,
  'queryKey'
>;

export const useMeQuery = (options?: UseMeQueryOptions) => {
  const { accessToken, setIsAppLoading, setIsLoggedIn, setAccessToken } =
    useAuthSore();

  const defaultOptions: Partial<UseMeQueryOptions> = {
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
  };

  const enabled = !!accessToken && (options?.enabled ?? true);
  const resolvedOptions: UseMeQueryOptions = {
    ...defaultOptions,
    ...options,
    enabled,
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
          setAccessToken(null);
          setIsLoggedIn(false);
        }
        throw error;
      } finally {
        setIsAppLoading(false);
      }
    },
    ...resolvedOptions,
  });

  return result;
};
