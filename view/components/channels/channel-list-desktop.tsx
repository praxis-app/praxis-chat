import { useAppStore } from '@/store/app.store';
import { GENERAL_CHANNEL_NAME } from '@common/channels/channel.constants';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useParams } from 'react-router-dom';
import { api } from '../../client/api-client';
import { NavigationPaths } from '../../constants/shared.constants';
import { useGeneralChannel } from '../../hooks/use-general-channel';
import { useServerData } from '../../hooks/use-server-data';
import { CurrentUserRes } from '../../types/user.types';
import { ChannelListItemDesktop } from './channel-list-item-desktop';

interface Props {
  me?: CurrentUserRes;
}

/**
 * Channel list component for the left navigation panel on desktop
 */
export const ChannelListDesktop = ({ me }: Props) => {
  const { isAppLoading } = useAppStore();

  const { serverId, serverSlug, serverPath } = useServerData();
  const { channelId } = useParams();
  const { pathname } = useLocation();

  const { data: channelsData, isLoading: isChannelsLoading } = useQuery({
    queryKey: ['servers', serverId, 'channels'],
    queryFn: async () => {
      if (!serverId) {
        throw new Error('No current server found');
      }
      return api.getJoinedChannels(serverId);
    },
    enabled: !!me && !!serverId,
  });

  const { data: generalChannelData, isLoading: isGeneralChannelLoading } =
    useGeneralChannel({ enabled: !me && !isAppLoading });

  const isLoading =
    isChannelsLoading || isGeneralChannelLoading || isAppLoading;

  // TODO: Add skeleton loader
  if (!serverSlug || isLoading) {
    return <div className="flex flex-1" />;
  }

  if (generalChannelData && !me) {
    return (
      <div className="flex flex-1 flex-col overflow-y-scroll py-2 select-none">
        <ChannelListItemDesktop
          channel={generalChannelData.channel}
          serverSlug={serverSlug}
          isGeneralChannel
          isActive
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-0.5 overflow-y-scroll py-2 select-none">
      {channelsData?.channels.map((channel) => {
        const isHome =
          pathname === NavigationPaths.Home || pathname === serverPath;

        const isGeneral = channel.name === GENERAL_CHANNEL_NAME;
        const isActive = channelId === channel.id || (isHome && isGeneral);

        return (
          <ChannelListItemDesktop
            key={channel.id}
            channel={channel}
            isActive={isActive}
            serverSlug={serverSlug}
          />
        );
      })}
    </div>
  );
};
