import { api } from '@/client/api-client';
import { GENERAL_CHANNEL_NAME } from '@/constants/channel.constants';
import { FeedItem, FeedQuery } from '@/types/channel.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Wizard, WizardStepData } from '../../shared/wizard/wizard';
import { Form } from '../../ui/form';
import {
  CreateProposalFormSchema,
  createProposalFormSchema,
} from './create-proposa-form.types';
import { BasicProposalStep } from './create-proposal-form-steps/basic-proposal-step';
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
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);

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
      return api.createProposal(channelId, {
        body: values.body?.trim(),
        action: {
          actionType: values.action,
          ...(values.permissions && { permissions: values.permissions }),
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
  const showRolesPermissionsStep = actionType === 'change-role';

  const steps: WizardStepData[] = [
    {
      id: 'basic',
      title: t('proposals.wizard.basicInfo'),
      description: t('proposals.wizard.basicInfoDescription'),
      component: BasicProposalStep,
    },
    ...(showRolesPermissionsStep
      ? [
          {
            id: 'role-selection',
            title: t('proposals.wizard.selectRole'),
            description: t('proposals.wizard.selectRoleDescription'),
            component: RoleSelectionStep,
          },
          {
            id: 'roles-permissions',
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
    <Form {...form}>
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
    </Form>
  );
};
