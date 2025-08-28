import { AddCircle, ArrowForwardIos } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent as MuiCardContent,
  styled,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../client/api-client';
import TopNav from '../../components/nav/top-nav';
import AddRoleMemberOption from '../../components/roles/add-role-member-option';
import PermissionDenied from '../../components/roles/permission-denied';
import PermissionsForm from '../../components/roles/permissions-form';
import RoleForm from '../../components/roles/role-form';
import RoleMember from '../../components/roles/role-member';
import DeleteButton from '../../components/shared/delete-button';
import Modal from '../../components/shared/modal';
import ProgressBar from '../../components/shared/progress-bar';
import { NavigationPaths } from '../../constants/shared.constants';
import { useAbility } from '../../hooks/role.hooks';
import { useAboveBreakpoint } from '../../hooks/shared.hooks';
import { useAppStore } from '../../store/app.store';
import { Role } from '../../types/role.types';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 16,
  },
}));

const FlexCardContent = styled(MuiCardContent)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  paddingBottom: 12,
  paddingTop: 13,
}));

enum EditRoleTabName {
  Permissions = 'permissions',
  Members = 'members',
}

export const EditRolePage = () => {
  const [tab, setTab] = useState(0);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const { setToast } = useAppStore((state) => state);

  const [searchParams, setSearchParams] = useSearchParams();
  const isAboveSmall = useAboveBreakpoint('sm');
  const queryClient = useQueryClient();
  const { roleId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const ability = useAbility();
  const canManageRoles = ability.can('manage', 'Role');

  const {
    data: roleData,
    isPending: isRolePending,
    error: roleError,
  } = useQuery({
    queryKey: ['role', roleId],
    queryFn: () => api.getRole(roleId!),
    enabled: !!roleId && canManageRoles,
  });

  const { data: eligibleUsersData, error: eligibleUsersError } = useQuery({
    queryKey: ['role', roleId, 'members', 'eligible'],
    queryFn: () => api.getUsersEligibleForRole(roleId!),
    enabled: !!roleId && tab === 2 && canManageRoles,
  });

  const { mutate: addMembers } = useMutation({
    mutationFn: async () => {
      if (!roleId || !roleData || !eligibleUsersData) {
        return;
      }
      await api.addRoleMembers(roleId, selectedUserIds);

      const membersToAdd = selectedUserIds.map(
        (id) => eligibleUsersData.users.find((u) => u.id === id)!,
      );
      queryClient.setQueryData(['role', roleId], {
        role: {
          ...roleData.role,
          members: roleData.role.members.concat(membersToAdd),
        },
      });
      queryClient.setQueryData(['role', roleId, 'members', 'eligible'], {
        users: eligibleUsersData?.users.filter(
          (user) => !selectedUserIds.includes(user.id),
        ),
      });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setSelectedUserIds([]);
      setIsAddMemberModalOpen(false);
    },
    onError(error: AxiosError) {
      const errorMessage =
        (error.response?.data as string) || t('errors.somethingWentWrong');

      setToast({
        title: errorMessage,
        status: 'error',
      });
    },
  });

  const { mutate: deleteRole, isPending: isDeletePending } = useMutation({
    mutationFn: async () => {
      if (!roleId) {
        return;
      }
      await api.deleteRole(roleId);

      queryClient.setQueryData<{ roles: Role[] }>(['roles'], (oldData) => {
        if (!oldData) {
          return { roles: [] };
        }
        return {
          roles: oldData.roles.filter((role) => role.id !== roleId),
        };
      });
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });

  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (tabParam === EditRoleTabName.Permissions) {
      setTab(1);
      return;
    }
    if (tabParam === EditRoleTabName.Members) {
      setTab(2);
      return;
    }
    setTab(0);
  }, [tabParam, setTab]);

  const handleTabChange = (
    _: SyntheticEvent<Element, Event>,
    value: number,
  ) => {
    if (value === 1) {
      setSearchParams({ tab: EditRoleTabName.Permissions });
      return;
    }
    if (value === 2) {
      setSearchParams({ tab: EditRoleTabName.Members });
      return;
    }
    setSearchParams({});
  };

  const handleDeleteBtnClick = async () => {
    await navigate(NavigationPaths.Roles);
    deleteRole();
  };

  if (!canManageRoles) {
    return (
      <PermissionDenied
        topNavProps={{
          header: t('roles.headers.serverRoles'),
          onBackClick: () => navigate(NavigationPaths.Settings),
        }}
      />
    );
  }

  if (isRolePending) {
    return <ProgressBar />;
  }

  if (!roleData || roleError || eligibleUsersError) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  return (
    <>
      <TopNav
        header={roleData.role.name}
        onBackClick={() => navigate(NavigationPaths.Roles)}
      />

      <Card sx={{ marginBottom: 6 }}>
        <Tabs
          onChange={handleTabChange}
          value={tab}
          variant={isAboveSmall ? 'standard' : 'fullWidth'}
          centered
        >
          <Tab label={t('roles.tabs.display')} />
          <Tab label={t('roles.tabs.permissions')} />
          <Tab label={t('roles.tabs.members')} />
        </Tabs>
      </Card>

      {tab === 0 && (
        <>
          <RoleForm editRole={roleData.role} />

          <DeleteButton onClick={() => setIsConfirmModalOpen(true)}>
            {t('roles.actions.delete')}
          </DeleteButton>

          <Modal
            open={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
          >
            <Typography marginBottom={3}>
              {t('prompts.deleteItem', { itemType: 'role' })}
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
                sx={{ color: '#f44336' }}
                onClick={handleDeleteBtnClick}
                disabled={isDeletePending}
              >
                {t('actions.delete')}
              </Button>
            </Box>
          </Modal>
        </>
      )}

      {tab === 1 && <PermissionsForm role={roleData.role} />}

      {tab === 2 && (
        <>
          <Card sx={{ cursor: 'pointer', marginBottom: '12px' }}>
            <CardActionArea onClick={() => setIsAddMemberModalOpen(true)}>
              <FlexCardContent>
                <Box display="flex">
                  <AddCircle
                    sx={{
                      fontSize: 23,
                      marginRight: 1.25,
                    }}
                  />
                  <Typography>{t('roles.actions.addMembers')}</Typography>
                </Box>
                <ArrowForwardIos
                  fontSize="small"
                  sx={{ transform: 'translateY(2px)' }}
                />
              </FlexCardContent>
            </CardActionArea>
          </Card>

          {!!roleData.role.members.length && (
            <Card>
              <CardContent>
                {roleData.role.members.map((member) => (
                  <RoleMember
                    roleId={roleData.role.id}
                    roleMember={member}
                    key={member.id}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          <Modal
            title={t('roles.actions.addMembers')}
            actionLabel={t('roles.actions.add')}
            onClose={() => setIsAddMemberModalOpen(false)}
            closingAction={addMembers}
            open={isAddMemberModalOpen}
          >
            {eligibleUsersData?.users.map((user) => (
              <AddRoleMemberOption
                key={user.id}
                selectedUserIds={selectedUserIds}
                setSelectedUserIds={setSelectedUserIds}
                user={user}
              />
            ))}
          </Modal>
        </>
      )}
    </>
  );
};
