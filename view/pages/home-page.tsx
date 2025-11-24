import { ChannelSkeleton } from '@/components/channels/channel-skeleton';
import { ChannelView } from '@/components/channels/channel-view';
import { useGeneralChannel } from '../hooks/use-general-channel';

export const HomePage = () => {
  const { data: channelData, error: channelError } = useGeneralChannel();

  if (channelError) {
    throw new Error(channelError.message);
  }

  if (!channelData) {
    return <ChannelSkeleton />;
  }

  return <ChannelView channel={channelData.channel} isGeneralChannel />;
};
