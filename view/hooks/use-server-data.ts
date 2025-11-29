import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { api } from '../client/api-client';
import { useMeQuery } from './use-me-query';

export const useServerData = () => {
  const { serverSlug } = useParams();

  const {
    data: meData,
    isSuccess: isMeSuccess,
    isError: isMeError,
    isLoading: isMeLoading,
  } = useMeQuery({ enabled: !serverSlug });

  const { data: serverBySlugData, isLoading: isServerBySlugLoading } = useQuery(
    {
      queryKey: ['servers', serverSlug],
      queryFn: () => {
        if (!serverSlug) {
          throw new Error('Server slug is missing in URL');
        }
        return api.getServerBySlug(serverSlug);
      },
      enabled: !!serverSlug,
    },
  );

  const isDefaultServerQueryEnabled = () => {
    if (serverSlug) {
      return false;
    }
    if (isMeError) {
      return true;
    }
    return isMeSuccess && !meData?.user.currentServer?.id;
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
    defaultServerData?.server.id;

  const resolvedServerSlug = serverSlug ?? meData?.user.currentServer?.slug;

  return {
    serverId,
    serverSlug: resolvedServerSlug,
    isLoading: isMeLoading || isDefaultServerLoading || isServerBySlugLoading,
  };
};
