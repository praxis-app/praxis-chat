import { api } from '@/client/api-client';
import { ChannelView } from '@/components/channels/channel-view';
import { NavigationPaths } from '@/constants/shared.constants';
import { useServerData } from '@/hooks/use-server-data';
import { useAppStore } from '@/store/app.store';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';

export const ChannelPage = () => {
  const { inviteToken } = useAppStore();
  const { serverId } = useServerData();

  const { channelId } = useParams();
  const navigate = useNavigate();

  const { data: channelData, error: channelError } = useQuery({
    queryKey: ['servers', serverId, 'channels', channelId],
    queryFn: async () => {
      try {
        if (!serverId || !channelId) {
          throw new Error('Missing server or channel id');
        }
        const result = await api.getChannel(serverId, channelId, inviteToken);
        return result;
      } catch (error) {
        await navigate(NavigationPaths.Home);
        console.error(error);
        return null;
      }
    },
    enabled: !!channelId && !!serverId,
  });

  if (channelError) {
    throw new Error(channelError.message);
  }

  return <ChannelView channel={channelData?.channel} />;
};
