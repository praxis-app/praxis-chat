import { PROPOSAL_ACTION_TYPE } from '@/constants/proposal.constants';
import { useFormContext } from 'react-hook-form';
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
import { CreateProposalFormSchema } from '../create-proposa-form.types';

export const ProposalDetailsStep = () => {
  const form = useFormContext<CreateProposalFormSchema>();
  const { onNext } = useWizardContext();

  const { t } = useTranslation();

  const handleNext = () => {
    const actionType = form.getValues('action');
    if (actionType === 'change-role') {
      // This will be handled by the wizard logic
      onNext();
    } else {
      // For other action types, go to the final step
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {t('proposals.wizard.basicInfo')}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t('proposals.wizard.basicInfoDescription')}
        </p>
      </div>

      <div className="space-y-4">
        <FormField
          control={form.control}
          name="action"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('proposals.labels.actionType')}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('proposals.placeholders.action')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPOSAL_ACTION_TYPE.map((action) => (
                      <SelectItem key={action} value={action}>
                        {t(`proposals.actionTypes.${action}`)}
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
              <FormLabel>{t('proposals.labels.body')}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t('proposals.placeholders.body')}
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
          onClick={handleNext}
          disabled={!form.formState.isValid || form.watch('action') === ''}
        >
          {t('actions.next')}
        </Button>
      </div>
    </div>
  );
};
