import { api } from '@/client/api-client';
import { PERMISSION_KEYS } from '@/constants/role.constants';
import { getPermissionValues } from '@/lib/role.utils';
import { useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useWizardContext } from '../../../shared/wizard/wizard-hooks';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { ProposePermissionToggle } from '../../proposal-actions/propose-permission-toggle';
import { CreateProposalFormSchema } from '../create-proposa-form.types';

export const RolesPermissionsStep = () => {
  const form = useFormContext<CreateProposalFormSchema>();
  const { onNext, onPrevious } = useWizardContext();

  const { t } = useTranslation();

  const selectedRoleId = form.watch('selectedRoleId');
  const formPermissions = form.watch('permissions')!;

  const { data: roleData } = useQuery({
    queryKey: ['role', selectedRoleId],
    queryFn: () => api.getRole(selectedRoleId!),
    enabled: !!selectedRoleId,
  });

  const shapedRolePermissions = getPermissionValues(
    roleData?.role.permissions || [],
  ).reduce<Record<string, boolean>>((acc, permission) => {
    acc[permission.name] = permission.value;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {t('proposals.wizard.rolesPermissions')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('proposals.wizard.rolesPermissionsDescription')}
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('proposals.wizard.permissions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {PERMISSION_KEYS.map((permissionName) => (
              <ProposePermissionToggle
                key={permissionName}
                formPermissions={formPermissions}
                permissions={shapedRolePermissions}
                permissionName={permissionName}
                setValue={form.setValue}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          {t('actions.previous')}
        </Button>
        <Button onClick={onNext}>{t('actions.next')}</Button>
      </div>
    </div>
  );
};
