import { cn } from '@/lib/shared.utils';
import { ComponentType } from 'react';
import { FieldValues, FormProvider, UseFormReturn } from 'react-hook-form';
import { WizardProvider } from './wizard-context';

export interface WizardStepData {
  id: string;
  title: string;
  description?: string;
  component: ComponentType;
}

interface WizardProps<FormValues extends FieldValues> {
  steps: WizardStepData[];
  currentStep: number;
  className?: string;
  form: UseFormReturn<FormValues>;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const Wizard = <FormValues extends FieldValues>({
  steps,
  currentStep,
  className,
  form,
  onNext,
  onPrevious,
  onSubmit,
  isSubmitting,
}: WizardProps<FormValues>) => {
  const StepComponent = steps[currentStep].component;

  return (
    <FormProvider {...form}>
      <WizardProvider
        value={{
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
