import { createContext, useContext } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface ProposalFormData {
  body: string;
  action: '' | 'change-role' | 'change-settings' | 'create-role' | 'plan-event' | 'test';
  permissions?: Record<string, boolean>;
}

interface WizardContextType {
  form: UseFormReturn<ProposalFormData>;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const useWizardContext = () => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizardContext must be used within a WizardProvider');
  }
  return context;
};

export { WizardContext };
export type { ProposalFormData, WizardContextType };