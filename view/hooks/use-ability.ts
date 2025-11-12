// TODO: Account for servers map and instances

import { createMongoAbility } from '@casl/ability';
import { ServerAbility } from '@common/server-roles/server-ability';
import { useAppStore } from '../store/app.store';
import { useMeQuery } from './use-me-query';

export const useAbility = () => {
  const { isLoggedIn } = useAppStore();
  const { data: meData } = useMeQuery({
    enabled: isLoggedIn,
  });

  const permissions = meData?.user.permissions ?? [];
  const ability = createMongoAbility<ServerAbility>(permissions);

  return ability;
};
