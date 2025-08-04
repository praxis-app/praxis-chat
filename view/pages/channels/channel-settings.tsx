import { api } from '@/client/api-client';
import { ChannelSettingsForm } from '@/components/channels/channel-settings-form';
import { TopNav } from '@/components/nav/top-nav';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { NavigationPaths } from '@/constants/shared.constants';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

export const ChannelSettings = () => {
  const { channelId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: channelData } = useQuery({
    queryKey: ['channels', channelId],
    queryFn: () => api.getChannel(channelId!),
    enabled: !!channelId,
  });

  const goBack = () => {
    navigate(`${NavigationPaths.Channels}/${channelId}`);
  };

  if (!channelData?.channel) {
    return null;
  }

  return (
    <>
      <TopNav
        header={t('channels.headers.channelSettings')}
        backBtnIcon={<MdClose className="size-6" />}
        onBackClick={goBack}
        goBackOnEscape
      />

      <div className="flex h-full flex-col items-center justify-center p-4 md:p-18">
        <Card className="w-full max-w-md">
          <CardHeader>
            <VisuallyHidden>
              <CardTitle>{t('channels.headers.channelSettings')}</CardTitle>
            </VisuallyHidden>
            <CardDescription>
              {t('channels.headers.channelSettingsDescription')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ChannelSettingsForm
              editChannel={channelData.channel}
              onSuccess={goBack}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};
