import { api } from '@/client/api-client';
import { ChannelSkeleton } from '@/components/channels/channel-skeleton';
import { ChannelView } from '@/components/channels/channel-view';
import { GENERAL_CHANNEL_NAME } from '@common/channels/channel.constants';
import { useQuery } from '@tanstack/react-query';

export const HomePage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['channels', GENERAL_CHANNEL_NAME],
    queryFn: () => api.getGeneralChannel(),
  });

  if (error) {
    throw new Error(error.message);
  }

  if (isLoading) {
    return <ChannelSkeleton />;
  }

  if (!data) {
    return null;
  }

  return <ChannelView channel={data.channel} isGeneralChannel />;
};
