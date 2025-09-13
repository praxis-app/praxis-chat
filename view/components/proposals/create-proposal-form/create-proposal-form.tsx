import { api } from '@/client/api-client';
import { WizardStepData } from '@/components/shared/wizard/wizard.types';
import { GENERAL_CHANNEL_NAME } from '@/constants/channel.constants';
import { getPermissionValuesMap } from '@/lib/role.utils';
import { FeedItemRes, FeedQuery } from '@/types/channel.types';
import {
  CreateProposalActionRoleMemberReq,
  CreateProposalActionRolePermissionReq,
} from '@/types/proposal-action.types';
import { PermissionKeys } from '@/types/role.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Wizard } from '../../shared/wizard/wizard';
import { ProposalDetailsStep } from './create-proposal-form-steps/proposal-details-step';
import { ProposalReviewStep } from './create-proposal-form-steps/proposal-review-step';
import { RoleAttributesStep } from './create-proposal-form-steps/role-attributes-step';
import { RoleMembersStep } from './create-proposal-form-steps/role-members-step';
import { RoleSelectionStep } from './create-proposal-form-steps/role-selection-step';
import { RolesPermissionsStep } from './create-proposal-form-steps/roles-permissions-step';
import {
  CreateProposalFormSchema,
  createProposalFormSchema,
} from './create-proposal-form.types';

interface Props {
  channelId?: string;
  isGeneralChannel?: boolean;
  onSuccess: () => void;
  onNavigate: () => void;
}

export const CreateProposalForm = ({
  channelId,
  isGeneralChannel,
  onSuccess,
  onNavigate,
}: Props) => {
  const [currentStep, setCurrentStep] = useState(0);

  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const form = useForm<CreateProposalFormSchema>({
    resolver: zodResolver(createProposalFormSchema),
    defaultValues: {
      body: '',
      action: '',
      roleName: '',
      roleColor: '',
      permissions: {},
      roleMembers: [],
      selectedRoleId: '',
    },
  });

  const selectedRoleId = form.watch('selectedRoleId');
  const actionType = form.watch('action');

  const isRoleProposal =
    actionType === 'change-role' || actionType === 'create-role';

  const { data: roleData, isLoading: isRoleLoading } = useQuery({
    queryKey: ['role', selectedRoleId],
    queryFn: () => api.getRole(selectedRoleId!),
    enabled: isRoleProposal && !!selectedRoleId && currentStep > 1,
  });

  // Get eligible users for the selected role
  const { data: eligibleUsersData, isLoading: isEligibleUsersLoading } =
    useQuery({
      queryKey: ['role', selectedRoleId, 'members', 'eligible'],
      queryFn: () => api.getUsersEligibleForRole(selectedRoleId!),
      enabled: isRoleProposal && !!selectedRoleId && currentStep > 2,
    });

  const { mutate: createProposal, isPending } = useMutation({
    mutationFn: async (values: CreateProposalFormSchema) => {
      if (!channelId) {
        throw new Error('Channel ID is required');
      }
      if (!values.action) {
        throw new Error('Action is required');
      }

      const shapedRolePermissions = getPermissionValuesMap(
        roleData?.role?.permissions || [],
      );

      // Shape permissions from form format to API format and remove unchanged entries
      const permissionChanges = Object.entries(values.permissions || {}).reduce<
        CreateProposalActionRolePermissionReq[]
      >((result, [permissionName, permissionValue]) => {
        if (shapedRolePermissions[permissionName] === permissionValue) {
          return result;
        }
        switch (permissionName as PermissionKeys) {
          case 'manageChannels':
            result.push({
              subject: 'Channel',
              actions: [
                {
                  action: 'manage',
                  changeType: permissionValue ? 'add' : 'remove',
                },
              ],
            });
            break;
          case 'manageSettings':
            result.push({
              subject: 'ServerConfig',
              actions: [
                {
                  action: 'manage',
                  changeType: permissionValue ? 'add' : 'remove',
                },
              ],
            });
            break;
          case 'manageRoles':
            result.push({
              subject: 'Role',
              actions: [
                {
                  action: 'manage',
                  changeType: permissionValue ? 'add' : 'remove',
                },
              ],
            });
            break;
          case 'createInvites':
            result.push({
              subject: 'Invite',
              actions: [
                {
                  action: 'create',
                  changeType: permissionValue ? 'add' : 'remove',
                },
              ],
            });
            break;
          case 'manageInvites':
            result.push({
              subject: 'Invite',
              actions: [
                {
                  action: 'manage',
                  changeType: permissionValue ? 'add' : 'remove',
                },
              ],
            });
            break;
        }
        return result;
      }, []);

      const memberChanges: CreateProposalActionRoleMemberReq[] = [];
      for (const user of eligibleUsersData?.users || []) {
        if (values.roleMembers?.includes(user.id)) {
          memberChanges.push({ userId: user.id, changeType: 'add' });
        }
      }
      for (const member of roleData?.role?.members || []) {
        if (!values.roleMembers?.includes(member.id)) {
          memberChanges.push({ userId: member.id, changeType: 'remove' });
        }
      }

      const role =
        values.action === 'change-role' || values.action === 'create-role'
          ? {
              name: values.roleName,
              color: values.roleColor,
              permissions: permissionChanges,
              members: memberChanges,
              roleToUpdateId: values.selectedRoleId,
            }
          : undefined;

      return api.createProposal(channelId, {
        body: values.body?.trim(),
        action: {
          actionType: values.action,
          role,
        },

        // TODO: Handle images
        images: [],
      });
    },
    onSuccess: ({ proposal }) => {
      const resolvedChannelId = isGeneralChannel
        ? GENERAL_CHANNEL_NAME
        : channelId;

      if (!resolvedChannelId) {
        return;
      }

      // Optimistically insert new proposal at top of feed (no refetch)
      queryClient.setQueryData<FeedQuery>(
        ['feed', resolvedChannelId],
        (old) => {
          const newItem: FeedItemRes = {
            ...proposal,
            type: 'proposal',
          };
          if (!old) {
            return { pages: [{ feed: [newItem] }], pageParams: [0] };
          }
          const pages = old.pages.map((page, idx) => {
            if (idx !== 0) {
              return page;
            }
            const exists = page.feed.some(
              (fi) => fi.type === 'proposal' && fi.id === proposal.id,
            );
            if (exists) {
              return page;
            }
            return { feed: [newItem, ...page.feed] };
          });
          return { pages, pageParams: old.pageParams };
        },
      );

      onSuccess();
    },
    onError: () => {
      toast(t('proposals.errors.errorCreatingProposal'), {
        description: t('prompts.tryAgain'),
      });
    },
  });

  // Determine which steps to show based on action type
  const showChangeRoleSteps = actionType === 'change-role';

  const steps: WizardStepData[] = [
    {
      id: 'proposal-details',
      component: ProposalDetailsStep,
      props: { isLoading: false },
    },
    ...(showChangeRoleSteps
      ? [
          {
            id: 'role-selection',
            component: RoleSelectionStep,
            props: { isLoading: false },
          },
          {
            id: 'role-attributes',
            component: RoleAttributesStep,
            props: { isLoading: isRoleLoading },
          },
          {
            id: 'roles-permissions',
            component: RolesPermissionsStep,
            props: { isLoading: isRoleLoading },
          },
          {
            id: 'role-members',
            component: RoleMembersStep,
            props: { isLoading: isRoleLoading || isEligibleUsersLoading },
          },
        ]
      : []),
    {
      id: 'proposal-review',
      component: ProposalReviewStep,
      props: { isLoading: false },
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      onNavigate();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      onNavigate();
    }
  };

  const handleSubmit = () => {
    form.handleSubmit((values) => createProposal(values))();
  };

  return (
    <Wizard
      form={form}
      steps={steps}
      currentStep={currentStep}
      context={{
        selectedRole: roleData?.role,
        usersEligibleForRole: eligibleUsersData?.users,
      }}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      className="space-y-6"
    />
  );
};
