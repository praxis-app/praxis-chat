import { PERMISSION_KEYS } from '@/constants/role.constants';
import { useTranslation } from 'react-i18next';
import { ProposePermissionToggle } from '../../../proposal-actions/propose-permission-toggle';
import { useWizardContext } from '../../../shared/wizard/wizard-hooks';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { CreateProposalFormSchema } from '../create-proposa-form.types';

interface Props {
  stepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export const RolesPermissionsStep = (_props: Props) => {
  const { form, onNext, onPrevious } =
    useWizardContext<CreateProposalFormSchema>();

  const { t } = useTranslation();

  const permissions = form.watch('permissions') || {};

  const setFieldValue = (
    field: keyof CreateProposalFormSchema,
    value: CreateProposalFormSchema[keyof CreateProposalFormSchema],
  ) => {
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
        Object.entries(newPermissions).filter(([_, v]) => v !== undefined),
      ) as Record<string, boolean>;
      form.setValue('permissions', filteredPermissions, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else {
      form.setValue(field, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
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
                formValues={{ permissions }}
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
        <Button onClick={handleNext}>{t('actions.next')}</Button>
      </div>
    </div>
  );
};
