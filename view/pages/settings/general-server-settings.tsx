import { api } from '@/client/api-client';
import { TopNav } from '@/components/nav/top-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { NavigationPaths } from '@/constants/shared.constants';
import { useServerData } from '@/hooks/use-server-data';
import { handleError } from '@/lib/error.utils';
import { ServerConfigReq, ServerConfigRes } from '@/types/server-config.types';
import { serverConfigSchema } from '@common/server-configs/server-config.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as zod from 'zod';

export const GeneralServerSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { serverId, serverPath } = useServerData();

  const { data, isPending, error } = useQuery({
    queryKey: ['servers', serverId, 'configs'],
    queryFn: () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.getServerConfig(serverId);
    },
    enabled: !!serverId,
  });

  const form = useForm<zod.infer<typeof serverConfigSchema>>({
    resolver: zodResolver(serverConfigSchema),
    defaultValues: {
      anonymousUsersEnabled: false,
    },
    values: {
      anonymousUsersEnabled: data?.serverConfig.anonymousUsersEnabled ?? false,
    },
    mode: 'onChange',
  });

  const { mutate: updateServerConfig, isPending: isUpdatePending } =
    useMutation({
      mutationFn: async (formData: ServerConfigReq) => {
        if (!serverId) {
          throw new Error('Server ID is required');
        }
        await api.updateServerConfig(serverId, formData);
        return formData;
      },
      onSuccess: (formData) => {
        queryClient.setQueryData<{ serverConfig: ServerConfigRes }>(
          ['servers', serverId, 'configs'],
          (oldData) => {
            if (!oldData) {
              throw new Error('Server config not found');
            }
            return {
              serverConfig: {
                ...oldData.serverConfig,
                ...formData,
                updatedAt: new Date(),
              },
            };
          },
        );
        form.reset(form.getValues());
      },
      onError: (error: Error) => {
        handleError(error);
      },
    });

  if (error) {
    return <p>{t('errors.somethingWentWrong')}</p>;
  }

  if (isPending || !data) {
    return null;
  }

  return (
    <>
      <TopNav
        header={t('navigation.labels.general')}
        onBackClick={() => navigate(`${serverPath}${NavigationPaths.Settings}`)}
      />

      <Container>
        <Card>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((formValues) =>
                  updateServerConfig({
                    anonymousUsersEnabled: formValues.anonymousUsersEnabled,
                  }),
                )}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="anonymousUsersEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>
                          {t('settings.names.anonymousUsersEnabled')}
                        </FormLabel>
                        <FormDescription>
                          {t('settings.descriptions.anonymousUsersEnabled')}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={(checked) => field.onChange(checked)}
                          aria-label={t('settings.names.anonymousUsersEnabled')}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    disabled={isUpdatePending || !form.formState.isDirty}
                    type="submit"
                    className="w-20"
                  >
                    {t('actions.save')}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};
