import { cn } from '@/lib/shared.utils';
import { FieldValues, FormProvider, UseFormReturn } from 'react-hook-form';
import { WizardProvider } from './wizard-context';
import { WizardStepData } from './wizard.types';

interface WizardProps<FormValues extends FieldValues, ContextValues> {
  steps: WizardStepData[];
  currentStep: number;
  className?: string;
  form: UseFormReturn<FormValues>;
  context?: ContextValues;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const Wizard = <FormValues extends FieldValues, ContextValues>({
  steps,
  currentStep,
  className,
  form,
  context,
  onNext,
  onPrevious,
  onSubmit,
  isSubmitting,
}: WizardProps<FormValues, ContextValues>) => {
  const step = steps[currentStep];
  const StepComponent = step.component;

  return (
    <FormProvider {...form}>
      <WizardProvider
        value={{
          context,
          onNext,
          onPrevious,
          onSubmit,
          isSubmitting,
        }}
      >
        <div className={cn('space-y-6', className)}>
          <div className="min-h-[400px]">
            <StepComponent {...step.props} />
          </div>
        </div>
      </WizardProvider>
    </FormProvider>
  );
};
