import { createMongoAbility } from '@casl/ability';
import { AppAbility } from '@common/roles/app-ability';
import { useAppStore } from '../store/app.store';
import { useMeQuery } from './use-me-query';

export const useAbility = () => {
  const { isLoggedIn } = useAppStore();
  const { data: meData } = useMeQuery({
    enabled: isLoggedIn,
  });

  const permissions = meData?.user.permissions ?? [];
  const ability = createMongoAbility<AppAbility>(permissions);

  return ability;
};
