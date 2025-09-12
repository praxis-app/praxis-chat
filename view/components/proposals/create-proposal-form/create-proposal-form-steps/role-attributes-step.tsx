// TODO: Add remaining layout and functionality - the following is a WIP

import { WizardStepProps } from '@/components/shared/wizard/wizard.types';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ColorPicker } from '../../../shared/color-picker';
import { useWizardContext } from '../../../shared/wizard/wizard-hooks';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../ui/form';
import { Input } from '../../../ui/input';
import {
  CreateProposalFormSchema,
  CreateProposalWizardContext,
} from '../create-proposal-form.types';

export const RoleAttributesStep = ({ isLoading }: WizardStepProps) => {
  const {
    onNext,
    onPrevious,
    context: { selectedRole },
  } = useWizardContext<CreateProposalWizardContext>();

  const form = useFormContext<CreateProposalFormSchema>();
  const { t } = useTranslation();

  if (isLoading) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {t('proposals.headers.roleAttributes')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('proposals.descriptions.roleAttributesDescription')}
        </p>
      </div>

      <div className="space-y-4">
        <Card className="gap-3">
          <CardHeader>
            <CardTitle className="text-base">
              {t('proposals.headers.roleAttributesTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="roleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('roles.form.name')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('roles.form.name')}
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleColor"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ColorPicker
                      color={field.value || '#000000'}
                      label={t('roles.form.colorPickerLabel')}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {selectedRole && (
          <Card className="gap-2">
            <CardHeader>
              <CardTitle className="text-base">
                {t('proposals.headers.currentRoleInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: selectedRole.color }}
                  />
                  <span className="font-medium">{selectedRole.name}</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  {t('roles.labels.membersCount', {
                    count: selectedRole.memberCount,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
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
