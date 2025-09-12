import { PERMISSION_KEYS } from '@/constants/role.constants';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useWizardContext } from '../../../shared/wizard/wizard-hooks';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { ProposePermissionToggle } from '../../proposal-actions/propose-permission-toggle';
import { CreateProposalFormSchema } from '../create-proposa-form.types';

export const RolesPermissionsStep = () => {
  const form = useFormContext<CreateProposalFormSchema>();
  const formPermissions = form.watch('permissions')!;

  const { onNext, onPrevious } = useWizardContext();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {t('proposals.wizard.rolesPermissions')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('proposals.descriptions.rolesPermissionsDescription')}
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
