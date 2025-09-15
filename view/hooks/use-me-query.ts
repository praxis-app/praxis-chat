import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { api } from '../client/api-client';
import { LocalStorageKeys } from '../constants/shared.constants';
import { useAppStore } from '../store/app.store';
import { CurrentUserRes } from '../types/user.types';

export const useMeQuery = (
  options?: Omit<UseQueryOptions<{ user: CurrentUserRes }>, 'queryKey'>,
) => {
  const { setIsAppLoading, setIsLoggedIn } = useAppStore();

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const me = await api.getCurrentUser();
        setIsLoggedIn(true);
        return me;
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
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    ...options,
  });
};
