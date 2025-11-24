import { api } from '@/client/api-client';
import { GENERAL_CHANNEL_NAME } from '@common/channels/channel.constants';
import { useQuery } from '@tanstack/react-query';
import { useMeQuery } from './use-me-query';

export const useGeneralChannel = () => {
  const {
    data: meData,
    isSuccess: isMeSuccess,
    isError: isMeError,
  } = useMeQuery();

  const result = useQuery({
    queryKey: ['channels', GENERAL_CHANNEL_NAME],
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
        return null;
      }
    },
    enabled: isMeSuccess || isMeError,
  });

  return result;
};
