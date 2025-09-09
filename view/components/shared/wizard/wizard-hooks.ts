import { createContext, useContext } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';

export interface ProposalFormData extends FieldValues {
  body?: string;
  action:
    | ''
    | 'change-role'
    | 'change-settings'
    | 'create-role'
    | 'plan-event'
    | 'test';
  permissions?: Record<string, boolean>;
  roleMembers?: Array<{ userId: string; changeType: 'add' | 'remove' }>;
  selectedRoleId?: string;
}

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
