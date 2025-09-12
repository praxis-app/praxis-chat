import { cn } from '@/lib/shared.utils';
import { FieldValues, FormProvider, UseFormReturn } from 'react-hook-form';
import { WizardProvider } from './wizard-context';

interface WizardProps<FormValues extends FieldValues, ContextValues> {
  steps: (() => JSX.Element)[];
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
  const StepComponent = steps[currentStep];

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
            <StepComponent />
          </div>
        </div>
      </WizardProvider>
    </FormProvider>
  );
};
