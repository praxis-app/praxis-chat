import { useAppStore } from '@/store/app.store';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useParams } from 'react-router-dom';
import { api } from '../../client/api-client';
import { GENERAL_CHANNEL_NAME } from '../../constants/channel.constants';
import { NavigationPaths } from '../../constants/shared.constants';
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

  const { channelId } = useParams();
  const { pathname } = useLocation();

  const isRegistered = !!me && !me.anonymous;

  const { data: channelsData, isLoading: isChannelsLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: api.getChannels,
    enabled: isRegistered,
  });

  const { data: generalChannelData, isLoading: isGeneralChannelLoading } =
    useQuery({
      queryKey: ['channels', GENERAL_CHANNEL_NAME],
      queryFn: () => api.getGeneralChannel(),
      enabled: !isRegistered,
    });

  const isLoading =
    isChannelsLoading || isGeneralChannelLoading || isAppLoading;

  if (generalChannelData && !isRegistered && !isLoading) {
    return (
      <div className="flex flex-1 flex-col overflow-y-scroll py-2 select-none">
        <ChannelListItemDesktop
          channel={generalChannelData.channel}
          isGeneralChannel
          isActive
        />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-0.5 overflow-y-scroll py-2 select-none">
      {channelsData?.channels.map((channel) => {
        const isHome = pathname === NavigationPaths.Home;
        const isGeneral = channel.name === GENERAL_CHANNEL_NAME;
        const isActive = channelId === channel.id || (isHome && isGeneral);

        return (
          <ChannelListItemDesktop
            key={channel.id}
            channel={channel}
            isActive={isActive}
          />
        );
      })}
    </div>
  );
};
