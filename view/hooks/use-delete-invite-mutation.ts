import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { api } from '../client/api-client';
import { InviteRes } from '../types/invite.types';

export const useDeleteInviteMutation = (inviteId: string) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.deleteInvite(inviteId);

      queryClient.setQueryData<{ invites: InviteRes[] }>(
        ['invites'],
        (oldData) => {
          if (!oldData) {
            return { invites: [] };
          }
          return {
            invites: oldData.invites.filter((invite) => invite.id !== inviteId),
          };
        },
      );
    },
    onError: (error: AxiosError) =>
      toast((error.response?.data as string) || t('errors.somethingWentWrong')),
  });
};
