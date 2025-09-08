import { useTranslation } from 'react-i18next';
import { PERMISSION_KEYS } from '@/constants/role.constants';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { ProposePermissionToggle } from '../../proposal-actions/propose-permission-toggle';
import { useWizardContext } from '../wizard-hooks';

interface ProposalFormData {
  body: string;
  action: '' | 'change-role' | 'change-roles-and-permissions' | 'change-settings' | 'create-role' | 'plan-event' | 'test';
  permissions?: Record<string, boolean>;
}

interface RolesPermissionsStepProps {
  stepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export const RolesPermissionsStep = (_props: RolesPermissionsStepProps) => {
  const { t } = useTranslation();
  const { form, onNext, onPrevious } = useWizardContext();

  const formValues = form.getValues();
  const permissions = formValues.permissions || {};

  const setFieldValue = (field: string, value?: boolean) => {
    // Handle nested field paths like "permissions.manageRoles"
    if (field.startsWith('permissions.')) {
      const permissionKey = field.replace('permissions.', '');
      const currentPermissions = form.getValues('permissions') || {};
      const newPermissions = {
        ...currentPermissions,
        [permissionKey]: value,
      };
      // Filter out undefined values
      const filteredPermissions = Object.fromEntries(
        Object.entries(newPermissions).filter(([_, v]) => v !== undefined)
      ) as Record<string, boolean>;
      form.setValue('permissions', filteredPermissions);
    } else {
      form.setValue(field as keyof ProposalFormData, value as never);
    }
  };

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t('proposals.wizard.rolesPermissions')}</h2>
        <p className="text-sm text-muted-foreground">
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
                formValues={formValues as unknown as Record<string, unknown>}
                permissionName={permissionName}
                permissions={permissions}
                setFieldValue={setFieldValue}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          {t('actions.previous')}
        </Button>
        <Button onClick={handleNext}>
          {t('actions.next')}
        </Button>
      </div>
    </div>
  );
};