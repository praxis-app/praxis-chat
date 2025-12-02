import { api } from '@/client/api-client';
import { TopNav } from '@/components/nav/top-nav';
import { CreateServerForm } from '@/components/servers/create-server-form';
import { ServerListItem } from '@/components/servers/server-list-item';
import { PermissionDenied } from '@/components/shared/permission-denied';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const ManageServers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { instanceAbility, isLoading: isAbilityLoading } = useAbility();
  const canManageServers = instanceAbility.can('manage', 'Server');

  const {
    data: serversData,
    error: serversError,
    isPending: isServersPending,
  } = useQuery({
    queryKey: ['servers'],
    queryFn: api.getServers,
    enabled: canManageServers && !isAbilityLoading,
  });

  if (isAbilityLoading) {
    return null;
  }

  if (!canManageServers) {
    return (
      <PermissionDenied
        topNavProps={{
          header: t('settings.headers.manageServers'),
          onBackClick: () => navigate(NavigationPaths.Settings),
        }}
      />
    );
  }

  if (!serversData || isServersPending) {
    return null;
  }

  return (
    <>
      <TopNav
        header={t('settings.headers.manageServers')}
        onBackClick={() => navigate(NavigationPaths.Settings)}
      />

      <Container>
        <CreateServerForm />

        {serversData.servers.length > 0 && (
          <Card className="py-3">
            <CardContent className="flex flex-col gap-2 px-3">
              {serversData.servers.map((server) => (
                <ServerListItem key={server.id} server={server} />
              ))}
            </CardContent>
          </Card>
        )}

        {serversData.servers.length === 0 && (
          <p className="text-muted-foreground">{t('prompts.noContent')}</p>
        )}

        {serversError && <p>{t('errors.somethingWentWrong')}</p>}
      </Container>
    </>
  );
};
