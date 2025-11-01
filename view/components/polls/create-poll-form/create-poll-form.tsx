import { api } from '@/client/api-client';
import { WizardStepData } from '@/components/shared/wizard/wizard.types';
import { getPermissionValuesMap } from '@/lib/server-role.utils';
import { FeedItemRes, FeedQuery } from '@/types/channel.types';
import {
  CreatePollActionServerRoleMemberReq,
  CreatePollActionServerRolePermissionReq,
} from '@/types/poll-action.types';
import { PermissionKeys } from '@/types/server-role.types';
import { GENERAL_CHANNEL_NAME } from '@common/channels/channel.constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Wizard } from '../../shared/wizard/wizard';
import { PollDetailsStep } from './create-poll-form-steps/poll-details-step';
import { PollReviewStep } from './create-poll-form-steps/poll-review-step';
import { ServerRoleAttributesStep } from './create-poll-form-steps/server-role-attributes-step';
import { ServerRoleMembersStep } from './create-poll-form-steps/server-role-members-step';
import { ServerRoleSelectionStep } from './create-poll-form-steps/server-role-selection-step';
import { ServerRolePermissionsStep } from './create-poll-form-steps/server-role-permissions-step';
import {
  CreatePollFormSchema,
  createPollFormSchema,
} from './create-poll-form.types';

interface Props {
  channelId?: string;
  isGeneralChannel?: boolean;
  onSuccess: () => void;
  onNavigate: () => void;
}

export const CreatePollForm = ({
  channelId,
  isGeneralChannel,
  onSuccess,
  onNavigate,
}: Props) => {
  const [currentStep, setCurrentStep] = useState(0);

  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const form = useForm<CreatePollFormSchema>({
    resolver: zodResolver(createPollFormSchema),
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
    queryKey: ['serverRole', selectedServerRoleId],
    queryFn: () => api.getServerRole(selectedServerRoleId!),
    enabled: isRolePoll && !!selectedServerRoleId && currentStep > 1,
  });

  // Get eligible users for the selected role
  const { data: eligibleUsersData, isLoading: isEligibleUsersLoading } =
    useQuery({
      queryKey: ['serverRole', selectedServerRoleId, 'members', 'eligible'],
      queryFn: () => api.getUsersEligibleForServerRole(selectedServerRoleId!),
      enabled: isRolePoll && !!selectedServerRoleId && currentStep > 2,
    });

  const { mutate: createPoll, isPending } = useMutation({
    mutationFn: async (values: CreatePollFormSchema) => {
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

      const shapedRolePermissions = getPermissionValuesMap(
        serverRoleData?.serverRole?.permissions || [],
      );

      // Shape permissions from form format to API format and remove unchanged entries
      const permissionChanges = Object.entries(values.permissions || {}).reduce<
        CreatePollActionServerRolePermissionReq[]
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

      const serverRolePayload =
        values.action === 'change-role' || values.action === 'create-role'
          ? {
              name: nameChange,
              color: colorChange,
              permissions: permissionChanges,
              members: memberChanges,
              serverRoleToUpdateId: values.selectedServerRoleId,
            }
          : undefined;

      return api.createPoll(channelId, {
        body: values.body?.trim(),
        action: {
          actionType: values.action,
          serverRole: serverRolePayload,
        },
      });
    },
    onSuccess: ({ poll }) => {
      const resolvedChannelId = isGeneralChannel
        ? GENERAL_CHANNEL_NAME
        : channelId;

      if (!resolvedChannelId) {
        return;
      }

      // Optimistically insert new poll at top of feed (no refetch)
      queryClient.setQueryData<FeedQuery>(
        ['feed', resolvedChannelId],
        (old) => {
          const newItem: FeedItemRes = {
            ...poll,
            type: 'poll',
          };
          if (!old) {
            return { pages: [{ feed: [newItem] }], pageParams: [0] };
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
      id: 'poll-details',
      component: PollDetailsStep,
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
      id: 'poll-review',
      component: PollReviewStep,
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
