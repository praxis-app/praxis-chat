import { api } from '@/client/api-client';
import { TopNav } from '@/components/nav/top-nav';
import { ServerRole } from '@/components/roles/server-roles/server-role';
import { ServerRoleForm } from '@/components/roles/server-roles/server-role-form';
import { PermissionDenied } from '@/components/shared/permission-denied';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useServerData } from '../../hooks/use-server-data';

export const ServerRoles = () => {
  const { serverId, serverPath } = useServerData();

  const { data, isPending, error } = useQuery({
    queryKey: ['servers', serverId, 'roles'],
    queryFn: () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.getServerRoles(serverId);
    },
    enabled: !!serverId,
  });

  const { serverAbility } = useAbility();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const serverSettingsPath = `${serverPath}${NavigationPaths.Settings}`;

  if (!serverAbility.can('manage', 'ServerRole')) {
    return (
      <PermissionDenied
        topNavProps={{
          header: t('roles.headers.serverRoles'),
          onBackClick: () => navigate(serverSettingsPath),
        }}
      />
    );
  }

  if (isPending) {
    return null;
  }

  return (
    <>
      <TopNav
        header={t('navigation.labels.roles')}
        onBackClick={() => navigate(serverSettingsPath)}
      />
      <Container>
        <ServerRoleForm />

        {data && (
          <Card className="py-3">
            <CardContent className="flex flex-col gap-2 px-3">
              {data.serverRoles.map((role) => (
                <ServerRole key={role.id} serverRole={role} />
              ))}
            </CardContent>
          </Card>
        )}

        {error && <p>{t('errors.somethingWentWrong')}</p>}
      </Container>
    </>
  );
};
