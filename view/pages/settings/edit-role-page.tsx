import { AddRoleMemberOption } from '@/components/roles/add-role-member-option';
import { PermissionsForm } from '@/components/roles/permissions-form';
import { RoleForm } from '@/components/roles/role-form';
import { RoleMember } from '@/components/roles/role-member';
import { DeleteButton } from '@/components/shared/delete-button';
import { PermissionDenied } from '@/components/shared/permission-denied';
import { Container } from '@/components/ui/container';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuChevronRight, LuPlus } from 'react-icons/lu';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../client/api-client';
import { TopNav } from '../../components/nav/top-nav';
import { Modal } from '../../components/shared/modal';
import { ProgressBar } from '../../components/shared/progress-bar';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { NavigationPaths } from '../../constants/shared.constants';
import { useAbility } from '../../hooks/role.hooks';
import { Role } from '../../types/role.types';

enum EditRoleTabName {
  Permissions = 'permissions',
  Members = 'members',
}

export const EditRolePage = () => {
  const [activeTab, setActiveTab] = useState('display');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
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
    enabled: !!roleId && activeTab === 'members' && canManageRoles,
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

      toast.error(errorMessage);
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
      setActiveTab('permissions');
      return;
    }
    if (tabParam === EditRoleTabName.Members) {
      setActiveTab('members');
      return;
    }
    setActiveTab('display');
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'permissions') {
      setSearchParams({ tab: EditRoleTabName.Permissions });
      return;
    }
    if (value === 'members') {
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
    return <p>{t('errors.somethingWentWrong')}</p>;
  }

  return (
    <>
      <TopNav
        header={roleData.role.name}
        onBackClick={() => navigate(NavigationPaths.Roles)}
      />

      <Container>
        <Card className="mb-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="w-full">
              <TabsTrigger value="display">
                {t('roles.tabs.display')}
              </TabsTrigger>
              <TabsTrigger value="permissions">
                {t('roles.tabs.permissions')}
              </TabsTrigger>
              <TabsTrigger value="members">
                {t('roles.tabs.members')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsContent value="display">
            <RoleForm editRole={roleData.role} />

            <DeleteButton onClick={() => setIsConfirmModalOpen(true)}>
              {t('roles.actions.delete')}
            </DeleteButton>

            <Modal
              open={isConfirmModalOpen}
              onClose={() => setIsConfirmModalOpen(false)}
            >
              <p className="mb-3">
                {t('prompts.deleteItem', { itemType: 'role' })}
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsConfirmModalOpen(false)}
                >
                  {t('actions.cancel')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteBtnClick}
                  disabled={isDeletePending}
                >
                  {t('actions.delete')}
                </Button>
              </div>
            </Modal>
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionsForm role={roleData.role} />
          </TabsContent>

          <TabsContent value="members">
            <Card
              className="mb-3 cursor-pointer"
              onClick={() => setIsAddMemberModalOpen(true)}
            >
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center">
                  <LuPlus className="mr-3 h-5 w-5" />
                  <span>{t('roles.actions.addMembers')}</span>
                </div>
                <LuChevronRight className="h-4 w-4" />
              </CardContent>
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
          </TabsContent>
        </Tabs>
      </Container>
    </>
  );
};
