import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuX } from 'react-icons/lu';
import { api } from '../../client/api-client';
import { truncate } from '../../lib/text.utils';
import { RoleRes } from '../../types/role.types';
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
  roleId: string;
  roleMember: UserRes;
}

export const RoleMember = ({ roleId, roleMember }: Props) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutate: removeMember, isPending } = useMutation({
    async mutationFn() {
      await api.removeRoleMember(roleId, roleMember.id);
      setIsConfirmModalOpen(false);

      queryClient.setQueryData(['role', roleId], (data: { role: RoleRes }) => {
        const filteredMembers = data.role.members.filter(
          (member) => member.id !== roleMember.id,
        );
        return { role: { ...data.role, members: filteredMembers } };
      });
      queryClient.setQueryData(['roles'], (data: { roles: RoleRes[] }) => ({
        roles: data.roles.map((role) => ({
          ...role,
          memberCount: Math.max(0, role.memberCount - 1),
        })),
      }));
      queryClient.setQueryData(
        ['role', roleId, 'members', 'eligible'],
        (data: { users: UserRes[] }) => {
          return { users: [roleMember, ...data.users] };
        },
      );
    },
  });

  const name = roleMember.displayName || roleMember.name;
  const truncatedName = truncate(name, 18);

  return (
    <div className="mb-4 flex items-center justify-between last:mb-0">
      <div className="flex items-center">
        <UserAvatar userId={roleMember.id} name={name} className="mr-4" />
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
