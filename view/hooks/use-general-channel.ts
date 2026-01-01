import { api } from '@/client/api-client';
import { useQuery } from '@tanstack/react-query';
import { GENERAL_CHANNEL_NAME } from '../../common/channels/channel.constants';
import { useAuthData } from './use-auth-data';
import { useServerData } from './use-server-data';

interface UseGeneralChannelProps {
  enabled?: boolean;
}

export const useGeneralChannel = ({
  enabled = true,
}: UseGeneralChannelProps = {}) => {
  const { isMeSuccess, isMeError, accessToken } = useAuthData();
  const { serverId } = useServerData();

  const result = useQuery({
    queryKey: ['servers', serverId, 'channels', GENERAL_CHANNEL_NAME],
    queryFn: async () => {
      try {
        if (!serverId) {
          throw new Error('Server ID is required');
        }
        return api.getGeneralChannel(serverId);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    enabled:
      (isMeSuccess || isMeError || !accessToken) && !!serverId && enabled,
  });

  return result;
};
