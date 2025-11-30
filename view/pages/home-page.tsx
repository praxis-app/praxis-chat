import { ChannelSkeleton } from '@/components/channels/channel-skeleton';
import { ChannelView } from '@/components/channels/channel-view';
import { Navigate, useLocation } from 'react-router-dom';
import { NavigationPaths } from '../constants/shared.constants';
import { useGeneralChannel } from '../hooks/use-general-channel';
import { useServerData } from '../hooks/use-server-data';

export const HomePage = () => {
  const { data: channelData, error: channelError } = useGeneralChannel();

  const { serverPath } = useServerData();
  const { pathname } = useLocation();

  if (channelError) {
    throw new Error(channelError.message);
  }

  if (pathname === NavigationPaths.Home && serverPath !== NavigationPaths.Home) {
    return <Navigate to={serverPath} />;
  }

  if (!channelData) {
    return <ChannelSkeleton />;
  }

  return <ChannelView channel={channelData.channel} isGeneralChannel />;
};
