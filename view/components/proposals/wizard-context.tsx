import { ReactNode } from 'react';
import { WizardContext, WizardContextType } from './wizard-hooks';

interface WizardProviderProps {
  children: ReactNode;
  value: WizardContextType;
}

export const WizardProvider = ({ children, value }: WizardProviderProps) => {
  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
};