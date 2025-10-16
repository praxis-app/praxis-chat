import { api } from '@/client/api-client';
import { ChannelSkeleton } from '@/components/channels/channel-skeleton';
import { ChannelView } from '@/components/channels/channel-view';
import { GENERAL_CHANNEL_NAME } from '@common/channels/channel.constants';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

export const HomePage = () => {
  const { t } = useTranslation();

  const { data, isLoading, error } = useQuery({
    queryKey: ['channels', GENERAL_CHANNEL_NAME],
    queryFn: () => api.getGeneralChannel(),
  });

  if (isLoading) {
    return <ChannelSkeleton />;
  }

  if (!data || error) {
    return <p>{t('errors.somethingWentWrong')}</p>;
  }

  return <ChannelView channel={data.channel} isGeneralChannel />;
};
