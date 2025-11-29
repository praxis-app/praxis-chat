import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuX } from 'react-icons/lu';
import { api } from '../../client/api-client';
import { useServerId } from '../../hooks/use-server-id';
import { truncate } from '../../lib/text.utils';
import { ServerRoleRes } from '../../types/server-role.types';
import { UserRes } from '../../types/user.types';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { UserAvatar } from '../users/user-avatar';

interface Props {
  serverRoleId: string;
  serverRoleMember: UserRes;
}

export const ServerRoleMember = ({ serverRoleId, serverRoleMember }: Props) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { serverId } = useServerId();

  const { mutate: removeMember, isPending } = useMutation({
    async mutationFn() {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      await api.removeServerRoleMember(
        serverId,
        serverRoleId,
        serverRoleMember.id,
      );
      setIsConfirmModalOpen(false);

      queryClient.setQueryData(
        ['serverRole', serverRoleId],
        (data: { serverRole: ServerRoleRes }) => {
          const filteredMembers = data.serverRole.members.filter(
            (member) => member.id !== serverRoleMember.id,
          );
          return {
            serverRole: { ...data.serverRole, members: filteredMembers },
          };
        },
      );
      queryClient.setQueryData(
        ['serverRoles'],
        (data: { serverRoles: ServerRoleRes[] }) => ({
          serverRoles: data.serverRoles.map((role) => ({
            ...role,
            memberCount: Math.max(0, role.memberCount - 1),
          })),
        }),
      );
      queryClient.setQueryData(
        ['serverRole', serverRoleId, 'members', 'eligible'],
        (data: { users: UserRes[] }) => {
          return { users: [serverRoleMember, ...data.users] };
        },
      );
    },
  });

  const name = serverRoleMember.displayName || serverRoleMember.name;
  const truncatedName = truncate(name, 18);

  return (
    <div className="mb-4 flex items-center justify-between last:mb-0">
      <div className="flex items-center">
        <UserAvatar
          userId={serverRoleMember.id}
          name={name}
          imageId={serverRoleMember.profilePicture?.id}
          className="mr-4"
        />
        <span className="max-w-48 truncate">{truncatedName}</span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsConfirmModalOpen(true)}
        className="text-destructive hover:text-destructive"
      >
        <LuX className="h-4 w-4" />
      </Button>

      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="md:min-w-sm">
          <DialogHeader className="pt-3">
            <DialogTitle className="text-left">
              {t('roles.prompts.removeRoleMember')}
            </DialogTitle>
          </DialogHeader>

          <DialogDescription className="pb-3">{name}</DialogDescription>

          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => removeMember()}
              disabled={isPending}
            >
              {t('actions.remove')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
