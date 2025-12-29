import { ChannelSkeleton } from '@/components/channels/channel-skeleton';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../client/api-client';
import {
  LocalStorageKeys,
  NavigationPaths,
} from '../../constants/shared.constants';
import { useAppStore } from '../../store/app.store';

export const InviteCheck = () => {
  const { setInviteToken } = useAppStore();

  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();

  const { error } = useQuery({
    queryKey: ['invites', token],
    queryFn: async () => {
      if (!token) {
        return;
      }
      const { isValidInvite } = await api.validateInvite(token);
      if (!isValidInvite) {
        throw new Error('Invalid invite');
      }

      setInviteToken(token);
      localStorage.setItem(LocalStorageKeys.InviteToken, token);
      await navigate(NavigationPaths.Home);

      return isValidInvite;
    },
    enabled: !!token,
  });

  if (!token) {
    return <p>{t('invites.prompts.inviteRequired')}</p>;
  }
  if (error) {
    return <p>{t('invites.prompts.expiredOrInvalid')}</p>;
  }

  return <ChannelSkeleton />;
};
