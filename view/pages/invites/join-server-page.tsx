import { api } from '@/client/api-client';
import { ChannelSkeleton } from '@/components/channels/channel-skeleton';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAppStore } from '@/store/app.store';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Navigate, useParams } from 'react-router-dom';

export const JoinServerPage = () => {
  const { isLoggedIn, setInviteToken } = useAppStore();

  const { token } = useParams();
  const { t } = useTranslation();

  const { data, error, isLoading } = useQuery({
    queryKey: ['invites', token],
    queryFn: async () => {
      if (!token) {
        return;
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

  if (!isLoggedIn) {
    return <Navigate to={NavigationPaths.Home} />;
  }

  if (error || !token) {
    return <p>{t('invites.prompts.expiredOrInvalid')}</p>;
  }

  if (isLoading || !data) {
    return <ChannelSkeleton />;
  }

  return (
    <div>
      <h1>Join Server</h1>
      <p>TODO: Implement join server page</p>
      <p>Token: {token}</p>
    </div>
  );
};
