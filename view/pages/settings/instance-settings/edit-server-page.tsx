import { api } from '@/client/api-client';
import { TopNav } from '@/components/nav/top-nav';
import { ServerForm } from '@/components/servers/server-form';
import { DeleteButton } from '@/components/shared/delete-button';
import { PermissionDenied } from '@/components/shared/permission-denied';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { handleError } from '@/lib/error.utils';
import { ServerReq, ServerRes } from '@/types/server.types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

enum EditServerTabName {
  Properties = 'properties',
  Members = 'members',
}

export const EditServerPage = () => {
  const [activeTab, setActiveTab] = useState(EditServerTabName.Properties);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

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

  const { mutateAsync: updateServer, isPending: isUpdatePending } = useMutation(
    {
      mutationFn: async (values: ServerReq) => {
        if (!serverId || !server) {
          throw new Error('Server ID is required');
        }
        await api.updateServer(serverId, values);

        const updatedServer = { ...server, ...values } as ServerRes;

        queryClient.setQueryData<{ servers: ServerRes[] }>(
          ['servers'],
          (oldData) => {
            if (!oldData) {
              return { servers: [] };
            }
            return {
              servers: oldData.servers.map((s) =>
                s.id === serverId ? updatedServer : s,
              ),
            };
          },
        );

        return updatedServer;
      },
      onError(error: Error) {
        handleError(error);
      },
    },
  );

  const { mutate: deleteServer, isPending: isDeletePending } = useMutation({
    mutationFn: async () => {
      if (!serverId) {
        return;
      }
      await api.deleteServer(serverId);
      queryClient.setQueryData<{ servers: ServerRes[] }>(
        ['servers'],
        (oldData) => {
          if (!oldData) {
            return { servers: [] };
          }
          return {
            servers: oldData.servers.filter((s) => s.id !== serverId),
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

  const handleDeleteBtnClick = async () => {
    setIsConfirmDialogOpen(false);
    await navigate(NavigationPaths.ManageServers);
    deleteServer();
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
            <Card className="mb-1 pb-1.5">
              <CardContent>
                <ServerForm
                  className="pb-6"
                  editServer={server}
                  isSubmitting={isUpdatePending}
                  onSubmit={(fv) => updateServer(fv)}
                />
              </CardContent>
            </Card>

            <DeleteButton
              className="mt-2"
              onClick={() => setIsConfirmDialogOpen(true)}
            >
              {t('actions.delete')}
            </DeleteButton>

            <Dialog
              open={isConfirmDialogOpen}
              onOpenChange={() => setIsConfirmDialogOpen(false)}
            >
              <DialogContent>
                <DialogHeader className="pt-6">
                  <DialogTitle>
                    {t('prompts.deleteItem', { itemType: 'server' })}
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription>{server.name}</DialogDescription>

                <DialogFooter className="flex flex-row justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsConfirmDialogOpen(false)}
                  >
                    {t('actions.cancel')}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteBtnClick}
                    disabled={isDeletePending}
                  >
                    {t('actions.delete')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value={EditServerTabName.Members}>
            <p className="text-muted-foreground">{t('prompts.inDev')}</p>
          </TabsContent>
        </Tabs>
      </Container>
    </>
  );
};
