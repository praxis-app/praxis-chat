import { useTranslation } from 'react-i18next';
import { PROPOSAL_ACTION_TYPE } from '@/constants/proposal.constants';
import { Button } from '../../ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Textarea } from '../../ui/textarea';
import { useWizardContext } from '../wizard-hooks';

interface BasicProposalStepProps {
  stepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export const BasicProposalStep = (_props: BasicProposalStepProps) => {
  const { t } = useTranslation();
  const { form, onNext } = useWizardContext();

  const handleNext = () => {
    const actionType = form.getValues('action');
    if (actionType === 'change-roles-and-permissions') {
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
        <h2 className="text-lg font-semibold">{t('proposals.wizard.basicInfo')}</h2>
        <p className="text-sm text-muted-foreground">
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
        <Button onClick={handleNext} disabled={!form.formState.isValid}>
          {t('actions.next')}
        </Button>
      </div>
    </div>
  );
};