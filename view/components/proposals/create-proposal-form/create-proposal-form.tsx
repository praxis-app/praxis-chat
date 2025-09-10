import { api } from '@/client/api-client';
import { GENERAL_CHANNEL_NAME } from '@/constants/channel.constants';
import { FeedItem, FeedQuery } from '@/types/channel.types';
import { AbilityAction, AbilitySubject } from '@/types/role.types';
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
      permissions: [],
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

      // TODO: Refactor logic for transforming permissions to API format - likely too complex or incomplete

      // Transform permissions from form format to API format
      const transformedPermissions = values.permissions?.map((permission) => {
        // Map PermissionKeys to AbilitySubject and AbilityAction
        switch (permission.name) {
          case 'manageChannels':
            return {
              subject: 'Channel' as AbilitySubject,
              actions: ['manage'] as AbilityAction[],
            };
          case 'manageSettings':
            return {
              subject: 'ServerConfig' as AbilitySubject,
              actions: ['manage'] as AbilityAction[],
            };
          case 'manageRoles':
            return {
              subject: 'Role' as AbilitySubject,
              actions: ['manage'] as AbilityAction[],
            };
          case 'createInvites':
            return {
              subject: 'Invite' as AbilitySubject,
              actions: ['create'] as AbilityAction[],
            };
          case 'manageInvites':
            return {
              subject: 'Invite' as AbilitySubject,
              actions: ['manage'] as AbilityAction[],
            };
          default:
            return {
              subject: 'Channel' as AbilitySubject,
              actions: ['read'] as AbilityAction[],
            };
        }
      });

      return api.createProposal(channelId, {
        body: values.body?.trim(),
        action: {
          actionType: values.action,
          ...(transformedPermissions &&
            transformedPermissions.length > 0 && {
              permissions: transformedPermissions,
            }),
          ...(values.roleMembers && { members: values.roleMembers }),
          ...(values.selectedRoleId && {
            roleToUpdateId: values.selectedRoleId,
          }),
        },
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
