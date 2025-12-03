import { api } from '@/client/api-client';
import { TopNav } from '@/components/nav/top-nav';
import { PermissionDenied } from '@/components/shared/permission-denied';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { handleError } from '@/lib/error.utils';
import { cn } from '@/lib/shared.utils';
import { ServerReq, ServerRes } from '@/types/server.types';
import { ServerErrorKeys } from '@common/servers/server.constants';
import { serverFormSchema } from '@common/servers/server.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

enum EditServerTabName {
  Properties = 'properties',
  Members = 'members',
}

export const EditServerPage = () => {
  const [activeTab, setActiveTab] = useState(EditServerTabName.Properties);

  const [searchParams, setSearchParams] = useSearchParams();
  const { serverId } = useParams<{ serverId: string }>();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { instanceAbility, isLoading: isAbilityLoading } = useAbility();
  const canManageServers = instanceAbility.can('manage', 'Server');

  const {
    data: serversData,
    isPending: isServersPending,
    error: serversError,
  } = useQuery({
    queryKey: ['servers'],
    queryFn: api.getServers,
    enabled: canManageServers && !isAbilityLoading,
  });

  const server = serversData?.servers.find((s) => s.id === serverId);

  const form = useForm<ServerReq>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      name: server?.name || '',
      slug: server?.slug || '',
      description: server?.description || '',
    },
    values: server
      ? {
          name: server.name,
          slug: server.slug,
          description: server.description,
        }
      : undefined,
  });

  const { mutate: updateServer, isPending: isUpdatePending } = useMutation({
    mutationFn: async (values: ServerReq) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      await api.updateServer(serverId, values);

      queryClient.setQueryData<{ servers: ServerRes[] }>(
        ['servers'],
        (oldData) => {
          if (!oldData) {
            return { servers: [] };
          }
          return {
            servers: oldData.servers.map((s) =>
              s.id === serverId ? { ...s, ...values } : s,
            ),
          };
        },
      );
    },
    onError(error: Error) {
      handleError(error);
    },
  });

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === EditServerTabName.Members) {
      setActiveTab(EditServerTabName.Members);
      return;
    }
    setActiveTab(EditServerTabName.Properties);
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as EditServerTabName);
    if (value === EditServerTabName.Members) {
      setSearchParams({ tab: EditServerTabName.Members });
      return;
    }
    setSearchParams({});
  };

  if (isAbilityLoading || isServersPending) {
    return null;
  }

  if (!canManageServers) {
    return (
      <PermissionDenied
        topNavProps={{
          header: t('servers.headers.edit'),
          onBackClick: () => navigate(NavigationPaths.ManageServers),
        }}
      />
    );
  }

  if (!server) {
    return <p>{serversError ? t('errors.somethingWentWrong') : null}</p>;
  }

  return (
    <>
      <TopNav
        header={server.name}
        onBackClick={() => navigate(NavigationPaths.ManageServers)}
      />

      <Container>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4 h-10 w-full">
            <TabsTrigger value={EditServerTabName.Properties}>
              {t('servers.tabs.properties')}
            </TabsTrigger>
            <TabsTrigger value={EditServerTabName.Members}>
              {t('servers.tabs.members')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={EditServerTabName.Properties}>
            <Card className="pb-1.5">
              <CardContent>
                <Form {...form}>
                  <form
                    className={cn('space-y-4 pb-6')}
                    onSubmit={form.handleSubmit((fv) => updateServer(fv))}
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('servers.form.name')}</FormLabel>
                          <FormControl>
                            <Input {...field} autoComplete="off" />
                          </FormControl>
                          <FormMessage
                            errorOverrides={{
                              [ServerErrorKeys.NameLength]: t(
                                'servers.errors.nameLength',
                              ),
                            }}
                          />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('servers.form.slug')}</FormLabel>
                          <FormControl>
                            <Input {...field} autoComplete="off" />
                          </FormControl>
                          <FormMessage
                            errorOverrides={{
                              [ServerErrorKeys.SlugLength]: t(
                                'servers.errors.slugLength',
                              ),
                              [ServerErrorKeys.SlugInvalid]: t(
                                'servers.errors.invalidSlug',
                              ),
                            }}
                          />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('servers.form.description')}</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} />
                          </FormControl>
                          <FormMessage
                            errorOverrides={{
                              [ServerErrorKeys.DescriptionLength]: t(
                                'servers.errors.descriptionLength',
                              ),
                            }}
                          />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isUpdatePending}>
                      {isUpdatePending ? t('states.saving') : t('actions.save')}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value={EditServerTabName.Members}>
            <p className="text-muted-foreground">{t('prompts.inDev')}</p>
          </TabsContent>
        </Tabs>
      </Container>
    </>
  );
};
