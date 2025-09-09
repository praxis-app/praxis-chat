import { ReactNode } from 'react';
import { FieldValues } from 'react-hook-form';
import { WizardContext, WizardContextType } from './wizard-hooks';

interface WizardProviderProps<T extends FieldValues = FieldValues> {
  children: ReactNode;
  value: WizardContextType<T>;
}

export const WizardProvider = <T extends FieldValues = FieldValues>({
  children,
  value,
}: WizardProviderProps<T>) => {
  return (
    <WizardContext.Provider value={value as WizardContextType<FieldValues>}>{children}</WizardContext.Provider>
  );
};
