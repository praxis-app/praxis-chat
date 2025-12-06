import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useParams } from 'react-router-dom';
import { api } from '../client/api-client';
import { NavigationPaths } from '../constants/shared.constants';
import { useAppStore } from '../store/app.store';
import { useMeQuery } from './use-me-query';

export const useServerData = () => {
  const { isLoggedIn, inviteToken } = useAppStore();
  const { serverSlug } = useParams();

  const {
    data: meData,
    isSuccess: isMeSuccess,
    isError: isMeError,
    isLoading: isMeLoading,
  } = useMeQuery({ enabled: !serverSlug });

  const {
    data: serverBySlugData,
    isLoading: isServerBySlugLoading,
    error: serverBySlugError,
  } = useQuery({
    queryKey: ['servers', serverSlug],
    queryFn: () => {
      if (!serverSlug) {
        throw new Error('Server slug is missing in URL');
      }
      return api.getServerBySlug(serverSlug);
    },
    enabled: !!serverSlug && isLoggedIn,
  });

  const {
    data: serverByInviteTokenData,
    isLoading: isServerByInviteTokenLoading,
  } = useQuery({
    queryKey: ['servers', 'invite', inviteToken],
    queryFn: () => api.getServerByInviteToken(inviteToken!),
    enabled: !!inviteToken && !isMeError && !serverSlug,
  });

  const isDefaultServerQueryEnabled = () => {
    if (!serverSlug) {
      if (isMeError) {
        return true;
      }
      return isMeSuccess && !meData?.user.currentServer?.id;
    }

    if (!isLoggedIn) {
      return !inviteToken;
    }

    return (
      isAxiosError(serverBySlugError) &&
      serverBySlugError.response?.status === 401
    );
  };

  const { data: defaultServerData, isLoading: isDefaultServerLoading } =
    useQuery({
      queryKey: ['servers', 'default'],
      queryFn: api.getDefaultServer,
      enabled: isDefaultServerQueryEnabled(),
    });

  const serverId =
    serverBySlugData?.server.id ||
    meData?.user.currentServer?.id ||
    serverByInviteTokenData?.server.id ||
    defaultServerData?.server.id;

  const resolvedServerSlug =
    serverSlug ||
    meData?.user.currentServer?.slug ||
    serverByInviteTokenData?.server.slug ||
    defaultServerData?.server.slug;

  const resolvedServerPath = resolvedServerSlug
    ? `/s/${resolvedServerSlug}`
    : NavigationPaths.Home;

  const isLoading =
    isMeLoading ||
    isDefaultServerLoading ||
    isServerBySlugLoading ||
    isServerByInviteTokenLoading;

  return {
    serverSlug: resolvedServerSlug,
    serverPath: resolvedServerPath,
    serverCount: meData?.user.serversCount,
    isLoading,
    serverId,
  };
};
