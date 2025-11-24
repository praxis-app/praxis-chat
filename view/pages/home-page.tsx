import { api } from '@/client/api-client';
import { ChannelSkeleton } from '@/components/channels/channel-skeleton';
import { ChannelView } from '@/components/channels/channel-view';
import { GENERAL_CHANNEL_NAME } from '@common/channels/channel.constants';
import { useQuery } from '@tanstack/react-query';
import { useMeQuery } from '../hooks/use-me-query';

export const HomePage = () => {
  const {
    data: meData,
    isSuccess: isMeSuccess,
    isError: isMeError,
  } = useMeQuery();

  // TODO: Consider creating a custom hook for this
  const { data: channelData, error: channelError } = useQuery({
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

  if (channelError) {
    throw new Error(channelError.message);
  }

  if (!channelData) {
    return <ChannelSkeleton />;
  }

  return <ChannelView channel={channelData.channel} isGeneralChannel />;
};
