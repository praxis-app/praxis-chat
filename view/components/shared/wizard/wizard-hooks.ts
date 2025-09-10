import { createContext, useContext } from 'react';

export interface WizardContextType {
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const WizardContext = createContext<WizardContextType | undefined>(
  undefined,
);

export const useWizardContext = (): WizardContextType => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizardContext must be used within a WizardProvider');
  }
  return context;
};
