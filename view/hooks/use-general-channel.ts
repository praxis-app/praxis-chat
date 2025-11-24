import { api } from '@/client/api-client';
import { GENERAL_CHANNEL_NAME } from '@common/channels/channel.constants';
import { useQuery } from '@tanstack/react-query';
import { useMeQuery } from './use-me-query';

interface UseGeneralChannelProps {
  enabled?: boolean;
}

export const useGeneralChannel = ({
  enabled = true,
}: UseGeneralChannelProps = {}) => {
  const {
    data: meData,
    isSuccess: isMeSuccess,
    isError: isMeError,
  } = useMeQuery();

  const result = useQuery({
    queryKey: [
      'channels',
      GENERAL_CHANNEL_NAME,
      meData?.user.currentServer?.id,
    ],
    queryFn: async () => {
      try {
        let serverId = meData?.user.currentServer?.id;
        if (!serverId) {
          const { server } = await api.getDefaultServer();
          serverId = server.id;
        }
        return api.getGeneralChannel(serverId);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    enabled: (isMeSuccess || isMeError) && enabled,
  });

  return result;
};
