import { api } from '@/client/api-client';
import { useQuery } from '@tanstack/react-query';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import { CreateProposalFormSchema } from '../create-proposa-form.types';

export const RoleSelectionStep = () => {
  const form = useFormContext<CreateProposalFormSchema>();
  const { onNext, onPrevious } = useWizardContext();

  const { t } = useTranslation();

  // Get all available roles
  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.getRoles(),
  });

  const roles = rolesData?.roles || [];

  const handleNext = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {t('proposals.wizard.selectRole')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('proposals.wizard.selectRoleDescription')}
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('proposals.wizard.availableRoles')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="selectedRoleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('proposals.wizard.roleSelection')}</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t(
                            'proposals.wizard.selectRolePlaceholder',
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoading ? (
                          <div className="text-muted-foreground p-2 text-sm">
                            {t('actions.loading')}
                          </div>
                        ) : (
                          roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              <div className="flex items-center space-x-2">
                                <div
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: role.color }}
                                />
                                <span>{role.name}</span>
                                <span className="text-muted-foreground text-xs">
                                  (
                                  {t('roles.labels.membersCount', {
                                    count: role.memberCount,
                                  })}
                                  )
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {form.watch('selectedRoleId') && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t('proposals.wizard.selectedRoleInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const selectedRole = roles.find(
                  (role) => role.id === form.watch('selectedRoleId'),
                );
                if (!selectedRole) {
                  return null;
                }

                return (
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
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          {t('actions.previous')}
        </Button>
        <Button onClick={handleNext} disabled={!form.watch('selectedRoleId')}>
          {t('actions.next')}
        </Button>
      </div>
    </div>
  );
};
