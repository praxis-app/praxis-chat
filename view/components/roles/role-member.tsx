import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../client/api-client';
import { Role } from '../../types/role.types';
import { User } from '../../types/user.types';
import { UserAvatar } from '../users/user-avatar';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { LuX } from 'react-icons/lu';

interface Props {
  roleId: string;
  roleMember: User;
}

export const RoleMember = ({ roleId, roleMember }: Props) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutate: removeMember, isPending } = useMutation({
    async mutationFn() {
      await api.removeRoleMember(roleId, roleMember.id);
      setIsConfirmModalOpen(false);

      queryClient.setQueryData(['role', roleId], (data: { role: Role }) => {
        const filteredMembers = data.role.members.filter(
          (member) => member.id !== roleMember.id,
        );
        return { role: { ...data.role, members: filteredMembers } };
      });
      queryClient.setQueryData(['roles'], (data: { roles: Role[] }) => ({
        roles: data.roles.map((role) => ({
          ...role,
          memberCount: Math.max(0, role.memberCount - 1),
        })),
      }));
      queryClient.setQueryData(
        ['role', roleId, 'members', 'eligible'],
        (data: { users: User[] }) => {
          return { users: [roleMember, ...data.users] };
        },
      );
    },
  });

  const roleMemberName = roleMember.displayName || roleMember.name;

  return (
    <div className="mb-3 flex items-center justify-between last:mb-0">
      <div className="flex items-center">
        <UserAvatar
          userId={roleMember.id}
          name={roleMember.name}
          className="mr-3"
        />
        <span className="mt-1">{roleMemberName}</span>
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

          <DialogDescription className="pb-3">
            {roleMemberName}
          </DialogDescription>

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
