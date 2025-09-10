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

interface WizardProps<T extends FieldValues = FieldValues> {
  steps: WizardStepData[];
  currentStep: number;
  className?: string;
  form: UseFormReturn<T>;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const Wizard = <T extends FieldValues = FieldValues>({
  steps,
  currentStep,
  className,
  form,
  onNext,
  onPrevious,
  onSubmit,
  isSubmitting,
}: WizardProps<T>) => {
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
