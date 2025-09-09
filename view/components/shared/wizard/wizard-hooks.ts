import { createContext, useContext } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';

export interface WizardContextType<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

export const WizardContext = createContext<
  WizardContextType<FieldValues> | undefined
>(undefined);

export const useWizardContext = <
  T extends FieldValues = FieldValues,
>(): WizardContextType<T> => {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizardContext must be used within a WizardProvider');
  }
  return context as WizardContextType<T>;
};
