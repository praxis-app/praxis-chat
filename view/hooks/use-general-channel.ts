import { api } from '@/client/api-client';
import { useServerData } from '@/hooks/use-server-data';
import { useAppStore } from '@/store/app.store';
import { GENERAL_CHANNEL_NAME } from '@common/channels/channel.constants';
import { useQuery } from '@tanstack/react-query';

interface UseGeneralChannelProps {
  enabled?: boolean;
}

export const useGeneralChannel = ({
  enabled = true,
}: UseGeneralChannelProps = {}) => {
  const { isAppLoading } = useAppStore();
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
    enabled: enabled && !isAppLoading && !!serverId,
    refetchOnMount: false,
  });

  return result;
};
