import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client/api-client';
import { handleError } from '../lib/error.utils';
import { InviteRes } from '../types/invite.types';

export const useDeleteInviteMutation = (inviteId: string) => {
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
    onError: handleError,
  });
};
