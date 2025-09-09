import { UseFormReturn } from 'react-hook-form';
import { cn } from '../../lib/shared.utils';
import { WizardProvider } from '../proposals/wizard-context';
import { ProposalFormData } from '../proposals/wizard-hooks';

interface StepComponentProps {
  stepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export interface WizardStepData {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<StepComponentProps>;
}

interface WizardProps {
  steps: WizardStepData[];
  currentStep: number;
  className?: string;
  form: UseFormReturn<ProposalFormData>;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const Wizard = ({
  steps,
  currentStep,
  className,
  form,
  onNext,
  onPrevious,
  onSubmit,
  isSubmitting,
}: WizardProps) => {
  return (
    <WizardProvider
      value={{
        form,
        onNext,
        onPrevious,
        onSubmit,
        isSubmitting,
      }}
    >
      <div className={cn('space-y-6', className)}>
        <div className="min-h-[400px]">
          {steps[currentStep] &&
            (() => {
              const StepComponent = steps[currentStep].component;
              return (
                <StepComponent
                  stepIndex={currentStep}
                  totalSteps={steps.length}
                  isFirstStep={currentStep === 0}
                  isLastStep={currentStep === steps.length - 1}
                />
              );
            })()}
        </div>
      </div>
    </WizardProvider>
  );
};
