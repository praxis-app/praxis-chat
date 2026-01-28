import { api } from '@/client/api-client';
import { WizardStepData } from '@/components/shared/wizard/wizard.types';
import { useServerData } from '@/hooks/use-server-data';
import { getServerPermissionValuesMap } from '@/lib/role.utils';
import { FeedItemRes, FeedQuery } from '@/types/channel.types';
import {
  CreatePollActionServerRoleMemberReq,
  CreatePollActionServerRolePermissionReq,
} from '@/types/poll-action.types';
import { ServerPermissionKeys } from '@/types/role.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Wizard } from '../../shared/wizard/wizard';
import { ProposalDetailsStep } from './create-proposal-form-steps/proposal-details-step';
import { ProposalReviewStep } from './create-proposal-form-steps/proposal-review-step';
import { ServerRoleAttributesStep } from './create-proposal-form-steps/server-role-attributes-step';
import { ServerRoleMembersStep } from './create-proposal-form-steps/server-role-members-step';
import { ServerRolePermissionsStep } from './create-proposal-form-steps/server-role-permissions-step';
import { ServerRoleSelectionStep } from './create-proposal-form-steps/server-role-selection-step';
import {
  CreateProposalFormSchema,
  createProposalFormSchema,
} from './create-proposal-form.types';

interface Props {
  channelId?: string;
  onSuccess: () => void;
  onNavigate: () => void;
}

export const CreateProposalForm = ({
  channelId,
  onSuccess,
  onNavigate,
}: Props) => {
  const [currentStep, setCurrentStep] = useState(0);

  const { t } = useTranslation();
  const { serverId } = useServerData();
  const queryClient = useQueryClient();

  const form = useForm<CreateProposalFormSchema>({
    resolver: zodResolver(createProposalFormSchema),
    defaultValues: {
      body: '',
      action: '',
      serverRoleName: '',
      serverRoleColor: '',
      permissions: {},
      serverRoleMembers: [],
      selectedServerRoleId: '',
    },
  });

  const selectedServerRoleId = form.watch('selectedServerRoleId');
  const actionType = form.watch('action');

  const isRolePoll =
    actionType === 'change-role' || actionType === 'create-role';

  const { data: serverRoleData, isLoading: isServerRoleLoading } = useQuery({
    queryKey: ['servers', serverId, 'roles', selectedServerRoleId],
    queryFn: () => {
      if (!serverId || !selectedServerRoleId) {
        throw new Error('Server ID and server role ID are required');
      }
      return api.getServerRole(serverId, selectedServerRoleId);
    },
    enabled:
      isRolePoll && !!serverId && !!selectedServerRoleId && currentStep > 1,
  });

  // Get eligible users for the selected role
  const { data: eligibleUsersData, isLoading: isEligibleUsersLoading } =
    useQuery({
      queryKey: [
        'servers',
        serverId,
        'roles',
        selectedServerRoleId,
        'members',
        'eligible',
      ],
      queryFn: () => {
        if (!serverId || !selectedServerRoleId) {
          throw new Error('Server ID and server role ID are required');
        }
        return api.getUsersEligibleForServerRole(
          serverId,
          selectedServerRoleId,
        );
      },
      enabled:
        isRolePoll && !!serverId && !!selectedServerRoleId && currentStep > 2,
    });

  const { mutate: createPoll, isPending } = useMutation({
    mutationFn: async (values: CreateProposalFormSchema) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      if (!channelId) {
        throw new Error('Channel ID is required');
      }
      if (!values.action) {
        throw new Error('Action is required');
      }

      const nameChange =
        values.serverRoleName !== serverRoleData?.serverRole?.name
          ? values.serverRoleName
          : undefined;

      const colorChange =
        values.serverRoleColor !== serverRoleData?.serverRole?.color
          ? values.serverRoleColor
          : undefined;

      const shapedRolePermissions = getServerPermissionValuesMap(
        serverRoleData?.serverRole?.permissions || [],
      );

      // Shape permissions from form format to API format and remove unchanged entries
      const permissionChanges = Object.entries(values.permissions || {}).reduce<
        CreatePollActionServerRolePermissionReq[]
      >((result, [permissionName, permissionValue]) => {
        if (shapedRolePermissions[permissionName] === permissionValue) {
          return result;
        }
        switch (permissionName as ServerPermissionKeys) {
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
          case 'manageServerSettings':
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
          case 'manageServerRoles':
            result.push({
              subject: 'ServerRole',
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
                  action: 'read',
                  changeType: permissionValue ? 'add' : 'remove',
                },
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

      const memberChanges: CreatePollActionServerRoleMemberReq[] = [];
      for (const user of eligibleUsersData?.users || []) {
        if (values.serverRoleMembers?.includes(user.id)) {
          memberChanges.push({ userId: user.id, changeType: 'add' });
        }
      }
      for (const member of serverRoleData?.serverRole?.members || []) {
        if (!values.serverRoleMembers?.includes(member.id)) {
          memberChanges.push({ userId: member.id, changeType: 'remove' });
        }
      }

      const serverRole =
        values.action === 'change-role' || values.action === 'create-role'
          ? {
              name: nameChange,
              color: colorChange,
              permissions: permissionChanges,
              members: memberChanges,
              serverRoleToUpdateId: values.selectedServerRoleId,
            }
          : undefined;

      return api.createPoll(serverId, channelId, {
        body: values.body?.trim(),
        pollType: 'proposal',
        action: {
          actionType: values.action,
          serverRole,
        },
      });
    },
    onSuccess: ({ poll }) => {
      if (!channelId || !serverId) {
        return;
      }

      // Optimistically insert new poll at top of feed (no refetch)
      queryClient.setQueryData<FeedQuery>(
        ['servers', serverId, 'channels', channelId, 'feed'],
        (old) => {
          const newItem: FeedItemRes = {
            ...poll,
            type: 'poll',
          };
          if (!old) {
            return {
              pages: [{ feed: [newItem] }],
              pageParams: [0],
            };
          }
          const pages = old.pages.map((page, idx) => {
            if (idx !== 0) {
              return page;
            }
            const exists = page.feed.some(
              (fi) => fi.type === 'poll' && fi.id === poll.id,
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
    onError(error: Error) {
      if (error instanceof AxiosError && error.response?.data) {
        toast(error.response?.data);
        return;
      }
      toast(t('polls.errors.errorCreatingProposal'), {
        description: error.message,
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
            id: 'server-role-selection',
            component: ServerRoleSelectionStep,
            props: { isLoading: false },
          },
          {
            id: 'server-role-attributes',
            component: ServerRoleAttributesStep,
            props: { isLoading: isServerRoleLoading },
          },
          {
            id: 'server-role-permissions',
            component: ServerRolePermissionsStep,
            props: { isLoading: isServerRoleLoading },
          },
          {
            id: 'server-role-members',
            component: ServerRoleMembersStep,
            props: {
              isLoading: isServerRoleLoading || isEligibleUsersLoading,
            },
          },
        ]
      : []),
    {
      id: 'proposal-review',
      component: ProposalReviewStep,
      props: { isLoading: false },
    },
  ];

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      const isValid = await form.trigger();
      if (!isValid) {
        return;
      }
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
    form.handleSubmit((values) => createPoll(values))();
  };

  return (
    <Wizard
      form={form}
      steps={steps}
      currentStep={currentStep}
      context={{
        selectedServerRole: serverRoleData?.serverRole,
        usersEligibleForServerRole: eligibleUsersData?.users,
      }}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  );
};
