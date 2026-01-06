import appIconImg from '@/assets/images/app-icon.png';
import { ChannelSkeleton } from '@/components/channels/channel-skeleton';
import { TopNav } from '@/components/nav/top-nav';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { useLogOut } from '@/hooks/use-log-out';
import { useServerData } from '@/hooks/use-server-data';
import { INITIAL_SERVER_NAME } from '@common/servers/server.constants';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';

export const HomePage = () => {
  const { serverPath, generalChannelId, currentUserHasNoServers, isLoading } =
    useServerData();

  const { mutate: logOut } = useLogOut();
  const { t } = useTranslation();

  if (currentUserHasNoServers) {
    return (
      <>
        <TopNav
          backBtnIcon={
            <img
              src={appIconImg}
              alt={INITIAL_SERVER_NAME}
              className="size-7 self-center"
            />
          }
        />
        <Container className="space-y-5">
          <div className="space-y-2">
            <p className="text-2xl font-bold">
              {t('servers.errors.noServersFound')}
            </p>
            <p className="text-muted-foreground">
              {t('servers.errors.noServersFoundDescription')}
            </p>
          </div>

          <Button
            variant="outline"
            className="w-24"
            onClick={() => {
              logOut();
            }}
          >
            {t('auth.actions.logOut')}
          </Button>
        </Container>
      </>
    );
  }

  if (isLoading || !generalChannelId) {
    return <ChannelSkeleton />;
  }

  return <Navigate to={`${serverPath}/c/${generalChannelId}`} />;
};
