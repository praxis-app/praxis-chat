import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../client/api-client';
import { Role } from '../../types/role.types';
import { User } from '../../types/user.types';
import { UserAvatar } from '../users/user-avatar';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
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

  return (
    <div className="flex justify-between items-center mb-3 last:mb-0">
      <div className="flex items-center">
        <UserAvatar
          userId={roleMember.id}
          name={roleMember.name}
          className="mr-3"
        />
        <span className="mt-1">
          {roleMember.displayName || roleMember.name}
        </span>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Remove role member?
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex gap-2 justify-end mt-4">
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
