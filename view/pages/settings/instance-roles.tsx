import { TopNav } from '@/components/nav/top-nav';
import { PermissionDenied } from '@/components/shared/permission-denied';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const InstanceRoles = () => {
  // const { data, isPending, error } = useQuery({
  //   queryKey: ['servers', serverId, 'roles'],
  //   queryFn: () => {
  //     if (!serverId) {
  //       throw new Error('Server ID is required');
  //     }
  //     return api.getInstanceRoles();
  //   },
  //   enabled: !!serverId,
  // });

  const { instanceAbility } = useAbility();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!instanceAbility.can('manage', 'InstanceRole')) {
    return (
      <PermissionDenied
        topNavProps={{
          header: t('roles.headers.instanceRoles'),
          onBackClick: () => navigate(NavigationPaths.Settings),
        }}
      />
    );
  }

  // if (isPending) {
  //   return null;
  // }

  return (
    <>
      <TopNav
        header={t('roles.headers.instanceRoles')}
        onBackClick={() => navigate(NavigationPaths.Settings)}
      />
      {/* <Container>
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
      </Container> */}
    </>
  );
};
