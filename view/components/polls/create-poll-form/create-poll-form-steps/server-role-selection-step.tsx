import { api } from '@/client/api-client';
import { MIDDOT_WITH_SPACES } from '@/constants/shared.constants';
import { getPermissionValuesMap } from '@/lib/server-role.utils';
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
import { CreatePollFormSchema } from '../create-poll-form.types';

export const ServerRoleSelectionStep = () => {
  const form = useFormContext<CreatePollFormSchema>();
  const { onNext, onPrevious } = useWizardContext();

  const { t } = useTranslation();

  const { data: serverRolesData, isLoading } = useQuery({
    queryKey: ['serverRoles'],
    queryFn: () => api.getServerRoles(),
  });
  const serverRoles = serverRolesData?.serverRoles || [];

  const handleValueChange = (value: string) => {
    const selectedServerRole = serverRoles.find(
      (serverRole) => serverRole.id === value,
    );

    if (selectedServerRole) {
      form.setValue('selectedServerRoleId', value);
      form.setValue('serverRoleName', selectedServerRole.name);
      form.setValue('serverRoleColor', selectedServerRole.color);

      form.setValue(
        'permissions',
        getPermissionValuesMap(selectedServerRole.permissions),
      );
      form.setValue(
        'serverRoleMembers',
        selectedServerRole.members.map((member) => member.id),
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {t('polls.headers.selectRole')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('polls.descriptions.selectRoleDescription')}
        </p>
      </div>

      <div className="space-y-4">
        <Card className="gap-3">
          <CardHeader>
            <CardTitle className="text-base">
              {t('polls.headers.availableRoles')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="selectedServerRoleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('polls.labels.roleSelection')}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={handleValueChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t(
                            'polls.placeholders.selectRolePlaceholder',
                          )}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoading ? (
                          <div className="text-muted-foreground p-2 text-sm">
                            {t('actions.loading')}
                          </div>
                        ) : (
                          serverRoles.map((serverRole) => (
                            <SelectItem key={serverRole.id} value={serverRole.id}>
                              <div className="flex items-center space-x-2">
                                <div
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: serverRole.color }}
                                />
                                <span>{serverRole.name}</span>
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

        {form.watch('selectedServerRoleId') && (
          <Card className="gap-2">
            <CardHeader>
              <CardTitle className="text-base">
                {t('polls.headers.selectedRoleInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const selectedServerRole = serverRoles.find(
                  (serverRole) =>
                    serverRole.id === form.watch('selectedServerRoleId'),
                );
                if (!selectedServerRole) {
                  return null;
                }

                return (
                  <div className="flex items-center space-x-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: selectedServerRole.color }}
                    />
                    <span className="font-medium">
                      {selectedServerRole.name}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {MIDDOT_WITH_SPACES}
                    </span>
                    <p className="text-muted-foreground text-sm">
                      {t('roles.labels.membersCount', {
                        count: selectedServerRole.memberCount,
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
        <Button
          onClick={onNext}
          disabled={!form.watch('selectedServerRoleId')}
        >
          {t('actions.next')}
        </Button>
      </div>
    </div>
  );
};
