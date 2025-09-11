import { api } from '@/client/api-client';
import { GENERAL_CHANNEL_NAME } from '@/constants/channel.constants';
import { FeedItem, FeedQuery } from '@/types/channel.types';
import { CreateProposalActionRolePermissionReq } from '@/types/proposal.types';
import { PermissionKeys } from '@/types/role.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Wizard, WizardStepData } from '../../shared/wizard/wizard';
import {
  CreateProposalFormSchema,
  createProposalFormSchema,
} from './create-proposa-form.types';
import { ProposalDetailsStep } from './create-proposal-form-steps/proposal-details-step';
import { ProposalReviewStep } from './create-proposal-form-steps/proposal-review-step';
import { RoleMembersStep } from './create-proposal-form-steps/role-members-step';
import { RoleSelectionStep } from './create-proposal-form-steps/role-selection-step';
import { RolesPermissionsStep } from './create-proposal-form-steps/roles-permissions-step';

interface CreateProposalFormProps {
  channelId?: string;
  isGeneralChannel?: boolean;
  onSuccess?: () => void;
}

export const CreateProposalForm = ({
  channelId,
  isGeneralChannel,
  onSuccess,
}: CreateProposalFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const form = useForm<CreateProposalFormSchema>({
    resolver: zodResolver(createProposalFormSchema),
    defaultValues: {
      body: '',
      action: '',
      permissions: {},
      roleMembers: [],
      selectedRoleId: '',
    },
  });

  const { mutate: createProposal, isPending } = useMutation({
    mutationFn: async (values: CreateProposalFormSchema) => {
      if (!channelId) {
        throw new Error('Channel ID is required');
      }
      if (!values.action) {
        throw new Error('Action is required');
      }

      // Shape permissions from form format to API format
      const shapedPermissions = Object.entries(values.permissions || {}).reduce<
        CreateProposalActionRolePermissionReq[]
      >((result, [permissionName, permissionValue]) => {
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

      const role =
        values.action === 'change-role' || values.action === 'create-role'
          ? {
              permissions: shapedPermissions,
              members: values.roleMembers,
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
      form.reset();

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
          const newItem: FeedItem = {
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

      onSuccess?.();
    },
    onError: () => {
      toast(t('proposals.errors.errorCreatingProposal'), {
        description: t('prompts.tryAgain'),
      });
    },
  });

  // Determine which steps to show based on action type
  const actionType = form.watch('action');
  const showChangeRoleSteps = actionType === 'change-role';

  const steps: WizardStepData[] = [
    {
      id: 'basic',
      title: t('proposals.wizard.basicInfo'),
      description: t('proposals.wizard.basicInfoDescription'),
      component: ProposalDetailsStep,
    },
    ...(showChangeRoleSteps
      ? [
          {
            id: 'role-selection',
            title: t('proposals.wizard.selectRole'),
            description: t('proposals.wizard.selectRoleDescription'),
            component: RoleSelectionStep,
          },
          {
            id: 'role-permissions',
            title: t('proposals.wizard.rolesPermissions'),
            description: t('proposals.wizard.rolesPermissionsDescription'),
            component: RolesPermissionsStep,
          },
          {
            id: 'role-members',
            title: t('proposals.wizard.roleMembers'),
            description: t('proposals.wizard.roleMembersDescription'),
            component: RoleMembersStep,
          },
        ]
      : []),
    {
      id: 'review',
      title: t('proposals.wizard.review'),
      description: t('proposals.wizard.reviewDescription'),
      component: ProposalReviewStep,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    form.handleSubmit((values) => createProposal(values))();
  };

  return (
    <Wizard
      steps={steps}
      currentStep={currentStep}
      className="space-y-6"
      form={form}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  );
};
