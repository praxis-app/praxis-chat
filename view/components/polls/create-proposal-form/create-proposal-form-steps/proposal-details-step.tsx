import { WizardStepProps } from '@/components/shared/wizard/wizard.types';
import { useAuthData } from '@/hooks/use-auth-data';
import { POLL_ACTION_TYPE } from '@common/poll-actions/poll-action.constants';
import { PollActionType } from '@common/poll-actions/poll-action.types';
import { ControllerRenderProps, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useWizardContext } from '../../../shared/wizard/wizard-hooks';
import { Button } from '../../../ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import { Textarea } from '../../../ui/textarea';
import { CreateProposalFormSchema } from '../create-proposal-form.types';

export const ProposalDetailsStep = ({ isLoading }: WizardStepProps) => {
  const form = useFormContext<CreateProposalFormSchema>();
  const { onNext } = useWizardContext();
  const { isAnon } = useAuthData();
  const { t } = useTranslation();

  const handleProposalActionChange = (
    value: string,
    field: ControllerRenderProps<CreateProposalFormSchema>,
  ) => {
    field.onChange(value);
    if (isAnon && value !== 'test') {
      form.setError('action', {
        type: 'manual',
        message: t('polls.errors.registerToCreateNonTestProposals'),
      });
    } else {
      form.clearErrors('action');
    }
  };

  const getProposalActionLabel = (action: PollActionType | '') => {
    if (action === 'general') {
      return t('polls.actionTypes.general');
    }
    if (action === 'change-role') {
      return t('polls.actionTypes.changeRole');
    }
    if (action === 'change-settings') {
      return t('polls.actionTypes.changeSettings');
    }
    if (action === 'create-role') {
      return t('polls.actionTypes.createRole');
    }
    if (action === 'plan-event') {
      return t('polls.actionTypes.planEvent');
    }
    if (action === 'test') {
      return t('polls.actionTypes.test');
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground text-sm">
        {t('actions.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {t('polls.headers.basicInfo')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('polls.descriptions.basicInfoDescription')}
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="action"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('polls.labels.actionType')}</FormLabel>
              <FormControl>
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    handleProposalActionChange(value, field)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('polls.placeholders.action')} />
                  </SelectTrigger>
                  <SelectContent>
                    {POLL_ACTION_TYPE.map((action) => (
                      <SelectItem key={action} value={action}>
                        {getProposalActionLabel(action)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('polls.labels.body')}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t('polls.placeholders.body')}
                  className="w-full resize-none md:min-w-md"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!form.formState.isValid && form.watch('action') === ''}
        >
          {t('actions.next')}
        </Button>
      </div>
    </div>
  );
};
