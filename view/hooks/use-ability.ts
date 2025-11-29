// TODO: Account for servers map and instances

import { createMongoAbility } from '@casl/ability';
import { ServerAbility } from '@common/server-roles/server-ability';
import { useAppStore } from '../store/app.store';
import { useMeQuery } from './use-me-query';
import { useServerData } from './use-server-data';

interface UseAbilityOptions {
  scope?: 'instance' | 'server';
}

export const useAbility = ({ scope = 'server' }: UseAbilityOptions = {}) => {
  const { isLoggedIn } = useAppStore();
  const { serverId } = useServerData();

  const { data: meData } = useMeQuery({
    enabled: isLoggedIn,
  });

  const getPermissions = () => {
    if (!meData) {
      return [];
    }
    const { permissions } = meData.user;
    if (scope === 'instance') {
      return permissions.instance ?? [];
    }
    if (!serverId) {
      throw new Error('Server ID is required for server scope');
    }
    return permissions.servers[serverId] ?? [];
  };

  const permissions = getPermissions();
  const ability = createMongoAbility<ServerAbility>(permissions);

  return ability;
};
