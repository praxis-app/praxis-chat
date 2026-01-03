import { api } from '@/client/api-client';
import { ChannelListItemDesktop } from '@/components/channels/channel-list-item-desktop';
import { useServerData } from '@/hooks/use-server-data';
import { useAppStore } from '@/store/app.store';
import { CurrentUserRes } from '@/types/user.types';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

interface Props {
  me?: CurrentUserRes;
}

/**
 * Channel list component for the left navigation panel on desktop
 */
export const ChannelListDesktop = ({ me }: Props) => {
  const { isAppLoading } = useAppStore();

  const { serverId, serverSlug } = useServerData();
  const { channelId } = useParams();

  const { data: channelsData, isLoading: isChannelsLoading } = useQuery({
    queryKey: ['servers', serverId, 'channels'],
    queryFn: async () => {
      if (!serverId) {
        throw new Error('Current server not found');
      }
      return api.getJoinedChannels(serverId);
    },
    enabled: !!me && !!serverId,
  });

  const { data: publicChannelsData, isLoading: isPublicChannelsLoading } =
    useQuery({
      queryKey: ['servers', serverId, 'channels', 'public'],
      queryFn: async () => {
        if (!serverId) {
          throw new Error('Current server not found');
        }
        return api.getPublicChannels(serverId);
      },
      enabled: !me && !!serverId,
    });

  const isLoading =
    isChannelsLoading || isPublicChannelsLoading || isAppLoading;

  // TODO: Add skeleton loader
  if (!serverSlug || isLoading) {
    return <div className="flex flex-1" />;
  }

  const channels = channelsData?.channels || publicChannelsData?.channels || [];

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
