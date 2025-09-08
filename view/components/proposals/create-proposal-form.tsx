import { api } from '@/client/api-client';
import { GENERAL_CHANNEL_NAME } from '@/constants/channel.constants';
import { PROPOSAL_ACTION_TYPE } from '@/constants/proposal.constants';
import { t } from '@/lib/shared.utils';
import { FeedItem, FeedQuery } from '@/types/channel.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { toast } from 'sonner';
import * as zod from 'zod';
import { Form } from '../ui/form';
import { Wizard, WizardStepData } from '../ui/wizard';
import { BasicProposalStep } from './wizard-steps/basic-proposal-step';
import { RolesPermissionsStep } from './wizard-steps/roles-permissions-step';
import { ReviewStep } from './wizard-steps/review-step';

const PROPOSAL_BODY_MAX = 6000;

interface CreateProposalFormProps {
  channelId?: string;
  isGeneralChannel?: boolean;
  onSuccess?: () => void;
}

const formSchema = zod.object({
  body: zod
    .string()
    .min(1)
    .max(PROPOSAL_BODY_MAX, {
      message: t('proposals.errors.longBody'),
    }),
  action: zod.enum([...PROPOSAL_ACTION_TYPE, '']),
  permissions: zod.record(zod.string(), zod.boolean()).optional(),
});

export const CreateProposalForm = ({
  channelId,
  isGeneralChannel,
  onSuccess,
}: CreateProposalFormProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<zod.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { body: '', action: '', permissions: {} },
  });

  const { mutate: createProposal, isPending } = useMutation({
    mutationFn: async (values: zod.infer<typeof formSchema>) => {
      if (!channelId) {
        throw new Error('Channel ID is required');
      }
      if (!values.action) {
        throw new Error('Action is required');
      }
      return api.createProposal(channelId, {
        body: values.body.trim(),
        action: { 
          actionType: values.action,
          ...(values.permissions && { permissions: values.permissions })
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
  const showRolesPermissionsStep = actionType === 'change-roles-and-permissions';

  const steps: WizardStepData[] = [
    {
      id: 'basic',
      title: t('proposals.wizard.basicInfo'),
      description: t('proposals.wizard.basicInfoDescription'),
      component: BasicProposalStep,
    },
    ...(showRolesPermissionsStep ? [{
      id: 'roles-permissions',
      title: t('proposals.wizard.rolesPermissions'),
      description: t('proposals.wizard.rolesPermissionsDescription'),
      component: RolesPermissionsStep,
    }] : []),
    {
      id: 'review',
      title: t('proposals.wizard.review'),
      description: t('proposals.wizard.reviewDescription'),
      component: ReviewStep,
    },
  ];

  const handleStepChange = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

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
        onStepChange={handleStepChange}
        allowStepNavigation={false}
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
