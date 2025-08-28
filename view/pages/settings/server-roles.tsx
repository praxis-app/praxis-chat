import { api } from '@/client/api-client';
import { TopNav } from '@/components/nav/top-nav';
import { Role } from '@/components/roles/role';
import { RoleForm } from '@/components/roles/role-form';
import { PermissionDenied } from '@/components/shared/permission-denied';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const ServerRoles = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ['roles'],
    queryFn: api.getRoles,
  });

  const { t } = useTranslation();
  const navigate = useNavigate();
  const ability = useAbility();

  if (!ability.can('manage', 'Role')) {
    return (
      <PermissionDenied
        topNavProps={{
          header: t('roles.headers.serverRoles'),
          onBackClick: () => navigate(NavigationPaths.Settings),
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
        onBackClick={() => navigate(NavigationPaths.Settings)}
      />
      <Container>
        <RoleForm />

        {data && (
          <Card>
            <CardContent>
              {data.roles.map((role) => (
                <Role key={role.id} role={role} />
              ))}
            </CardContent>
          </Card>
        )}

        {error && <p>{t('errors.somethingWentWrong')}</p>}
      </Container>
    </>
  );
};
