import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../client/api-client';
import { handleError } from '../lib/error.utils';
import { InviteRes } from '../types/invite.types';
import { useServerId } from './use-server-id';

export const useDeleteInviteMutation = (inviteId: string) => {
  const queryClient = useQueryClient();
  const { serverId } = useServerId();

  return useMutation({
    mutationFn: async () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      await api.deleteInvite(serverId, inviteId);

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
    onError(error: Error) {
      handleError(error);
    },
  });
};
