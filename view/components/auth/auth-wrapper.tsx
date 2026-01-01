import { useMeQuery } from '@/hooks/use-me-query';
import { useAppStore } from '@/store/app.store';
import { ReactNode, useEffect } from 'react';

interface Props {
  children: ReactNode;
}

export const AuthWrapper = ({ children }: Props) => {
  const { accessToken, setIsAppLoading } = useAppStore();

  useMeQuery({
    retry: import.meta.env.PROD ? 1 : 0,
  });

  useEffect(() => {
    if (!accessToken) {
      setIsAppLoading(false);
    }
  }, [accessToken, setIsAppLoading]);

  return <>{children}</>;
};
