import { RemoveCircle } from '@mui/icons-material';
import { Box, Button, IconButton, Typography, styled } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../client/api-client';
import { Role } from '../../types/role.types';
import { User } from '../../types/user.types';
import { Link } from '../shared/link';
import Modal from '../shared/modal';
import UserAvatar from '../users/user-avatar';

const OuterFlex = styled(Box)(() => ({
  display: 'flex',
  marginBottom: 12,
  '&:last-child': {
    marginBottom: 0,
  },
}));

interface Props {
  roleId: string;
  roleMember: User;
}

const RoleMember = ({ roleId, roleMember }: Props) => {
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
    <OuterFlex justifyContent="space-between">
      <Link to="/">
        <Box display="flex">
          <UserAvatar
            userId={roleMember.id}
            userName={roleMember.name}
            sx={{ marginRight: 1.5 }}
          />
          <Typography sx={{ marginTop: 1 }}>
            {roleMember.displayName || roleMember.name}
          </Typography>
        </Box>
      </Link>

      <IconButton onClick={() => setIsConfirmModalOpen(true)}>
        <RemoveCircle />
      </IconButton>

      <Modal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
      >
        <Typography marginBottom={3}>
          {t('prompts.removeItem', { itemType: 'role member' })}
        </Typography>

        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            onClick={() => setIsConfirmModalOpen(false)}
          >
            {t('actions.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={() => removeMember()}
            sx={{ color: '#f44336' }}
            disabled={isPending}
          >
            {t('actions.remove')}
          </Button>
        </Box>
      </Modal>
    </OuterFlex>
  );
};

export default RoleMember;
