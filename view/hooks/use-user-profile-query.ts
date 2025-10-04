import { api } from '@/client/api-client';
import { useQuery } from '@tanstack/react-query';

interface UseUserProfileQueryOptions {
  userId: string;
  enabled?: boolean;
}

// TODO: Remove this hook - it's only used by the `UserProfile` component
export const useUserProfileQuery = ({
  userId,
  enabled = true,
}: UseUserProfileQueryOptions) => {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => api.getUserProfile(userId),
    enabled: enabled && !!userId,
  });
};
