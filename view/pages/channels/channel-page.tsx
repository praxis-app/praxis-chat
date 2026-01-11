import { api } from '@/client/api-client';
import { ChannelView } from '@/components/channels/channel-view';
import { NavigationPaths } from '@/constants/shared.constants';
import { useServerData } from '@/hooks/use-server-data';
import { useAuthSore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

export const ChannelPage = () => {
  const { inviteToken } = useAuthSore();
  const { serverId } = useServerData();

  const { channelId, serverSlug } = useParams();
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

  const channel = channelData?.channel;
  const channelServerSlug = channel?.server?.slug;

  if (channelServerSlug && serverSlug !== channelServerSlug) {
    return <Navigate to={`/s/${channelServerSlug}/c/${channel.id}`} replace />;
  }

  if (channelError) {
    throw new Error(channelError.message);
  }

  return <ChannelView channel={channel} />;
};
