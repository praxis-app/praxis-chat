import { PERMISSION_KEYS } from '@/constants/role.constants';
import { PermissionKeys } from '@/types/role.types';
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

  const permissions = form.watch('permissions') || [];

  // TODO: Revisit whether an object should be used at all for permissions

  // Convert permissions array to object for easier access in components
  const permissionsObject = permissions.reduce(
    (acc, permission) => {
      acc[permission.name] = permission.value;
      return acc;
    },
    {} as Record<string, boolean>,
  );

  const updatePermission = (permissionName: PermissionKeys, value: boolean) => {
    const currentPermissions = form.getValues('permissions') || [];

    // Find existing permission or create new one
    const existingIndex = currentPermissions.findIndex(
      (p) => p.name === permissionName,
    );
    const newPermissions = [...currentPermissions];

    if (existingIndex >= 0) {
      // Update existing permission
      newPermissions[existingIndex] = { name: permissionName, value };
    } else {
      // Add new permission
      newPermissions.push({ name: permissionName, value });
    }

    form.setValue('permissions', newPermissions, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleNext = () => {
    onNext();
  };

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
                formValues={{ permissions: permissionsObject }}
                permissionName={permissionName}
                permissions={permissionsObject}
                updatePermission={updatePermission}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          {t('actions.previous')}
        </Button>
        <Button onClick={handleNext}>{t('actions.next')}</Button>
      </div>
    </div>
  );
};
