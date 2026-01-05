import { useMeQuery } from '@/hooks/use-me-query';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const AuthWrapper = ({ children }: Props) => {
  useMeQuery({ retry: import.meta.env.PROD ? 1 : 0 });
  return <>{children}</>;
};
