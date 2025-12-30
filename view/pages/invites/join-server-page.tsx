import { api } from '@/client/api-client';
import { ChannelSkeleton } from '@/components/channels/channel-skeleton';
import { TopNav } from '@/components/nav/top-nav';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { handleError } from '@/lib/error.utils';
import { useAppStore } from '@/store/app.store';
import chroma from 'chroma-js';
import ColorHash from 'color-hash';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

export const JoinServerPage = () => {
  const { setInviteToken } = useAppStore();
  const { isLoggedIn, isMeError } = useAuthData();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { token } = useParams();
  const { t } = useTranslation();

  const {
    data: isValidInviteData,
    error: isValidInviteError,
    isLoading: isValidInviteLoading,
  } = useQuery({
    queryKey: ['invites', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Invite token is required');
      }
      const { isValidInvite } = await api.isValidInvite(token);
      if (!isValidInvite) {
        throw new Error('Invalid invite');
      }
      setInviteToken(token);

      return isValidInvite;
    },
    enabled: !!token && isLoggedIn,
  });

  const {
    data: serverData,
    error: serverError,
    isLoading: isServerLoading,
  } = useQuery({
    queryKey: ['servers', 'invite', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('Invite token is required');
      }
      return api.getServerByInviteToken(token);
    },
    enabled: !!token && isLoggedIn && !!isValidInviteData,
  });

  const { mutateAsync: joinServer, isPending: isJoinServerPending } =
    useMutation({
      mutationFn: async () => {
        if (!token || !serverData?.server) {
          throw new Error('Missing invite token or server data');
        }
        await api.joinServer(serverData.server.id, token);
        return serverData.server.slug;
      },
      onSuccess: (serverSlug) => {
        queryClient.invalidateQueries({ queryKey: ['me'] });
        navigate(`/s/${serverSlug}`);
      },
      onError: (error: Error) => {
        handleError(error);
      },
    });

  if (isMeError) {
    return <Navigate to={NavigationPaths.Home} />;
  }

  if (isValidInviteError || serverError || !token) {
    return (
      <>
        <TopNav />
        <Container>
          <Card>
            <CardContent className="p-6">
              <p className="text-center">
                {t('invites.prompts.expiredOrInvalid')}
              </p>
            </CardContent>
          </Card>
        </Container>
      </>
    );
  }

  if (
    isValidInviteLoading ||
    isServerLoading ||
    !isValidInviteData ||
    !serverData
  ) {
    return <ChannelSkeleton />;
  }

  const getStringAvatarProps = () => {
    const colorHash = new ColorHash();
    const baseColor = colorHash.hex(serverData.server.name);
    const color = chroma(baseColor).brighten(1.5).hex();
    const backgroundColor = chroma(baseColor).darken(1.35).hex();

    return {
      style: { color, backgroundColor },
    };
  };

  const getInitial = (value: string) => {
    return (value?.trim()?.[0] || '?').toUpperCase();
  };

  return (
    <>
      <TopNav
        header={t('invites.headers.invitedToJoin', {
          serverName: serverData.server.name,
        })}
      />

      <Container>
        <Card>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">
                {t('invites.prompts.youHaveBeenInvited')}
              </h1>
              <p className="text-muted-foreground">
                {t('invites.prompts.joinServerToStart')}
              </p>
            </div>

            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback
                    className="text-lg font-light uppercase"
                    {...getStringAvatarProps()}
                  >
                    {getInitial(serverData.server.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <h2 className="text-lg font-semibold">
                    {serverData.server.name}
                  </h2>
                  {serverData.server.memberCount !== undefined && (
                    <p className="text-muted-foreground text-sm">
                      {t('roles.labels.membersCount', {
                        count: serverData.server.memberCount,
                      })}
                    </p>
                  )}
                </div>
              </div>

              {serverData.server.description && (
                <p className="text-muted-foreground">
                  {serverData.server.description}
                </p>
              )}
            </div>

            <div className="pt-1">
              <Button
                onClick={() => joinServer()}
                disabled={isJoinServerPending}
                className="w-full"
              >
                {t('invites.actions.acceptInvite')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </>
  );
};
