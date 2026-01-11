import { api } from '@/client/api-client';
import { ChannelListItemDesktop } from '@/components/channels/channel-list-item-desktop';
import { useAuthData } from '@/hooks/use-auth-data';
import { useServerData } from '@/hooks/use-server-data';
import { useAppStore } from '@/store/app.store';
import { useAuthSore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

/**
 * Channel list component for the left navigation panel on desktop
 */
export const ChannelListDesktop = () => {
  const { inviteToken } = useAuthSore();
  const { isAppLoading } = useAppStore();

  const { isMeSuccess, isAuthError } = useAuthData();
  const { serverId, serverSlug } = useServerData();

  const { channelId } = useParams();

  const { data: joinedChannelsData, isLoading: isJoinedChannelsLoading } =
    useQuery({
      queryKey: ['servers', serverId, 'channels', 'joined'],
      queryFn: async () => {
        if (!serverId) {
          throw new Error('Current server not found');
        }
        return api.getJoinedChannels(serverId);
      },
      enabled: !!serverId && isMeSuccess,
    });

  const { data: publicChannelsData, isLoading: isPublicChannelsLoading } =
    useQuery({
      queryKey: ['servers', serverId, 'channels', inviteToken],
      queryFn: async () => {
        if (!serverId) {
          throw new Error('Current server not found');
        }
        return api.getChannels(serverId, inviteToken);
      },
      enabled: !!serverId && isAuthError,
    });

  const isLoading =
    isJoinedChannelsLoading || isPublicChannelsLoading || isAppLoading;

  // TODO: Add skeleton loader
  if (!serverSlug || isLoading) {
    return <div className="flex flex-1" />;
  }

  const channels =
    joinedChannelsData?.channels || publicChannelsData?.channels || [];

  return (
    <div className="flex flex-1 flex-col gap-0.5 overflow-y-scroll py-2 select-none">
      {channels.map((channel) => (
        <ChannelListItemDesktop
          key={channel.id}
          channel={channel}
          isActive={channelId === channel.id}
          serverSlug={serverSlug}
        />
      ))}
    </div>
  );
};
