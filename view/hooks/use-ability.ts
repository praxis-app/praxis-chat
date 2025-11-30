import { createMongoAbility } from '@casl/ability';
import { InstanceAbility } from '@common/instance-roles/instance-ability';
import { ServerAbility } from '@common/server-roles/server-ability';
import { useAppStore } from '../store/app.store';
import { useMeQuery } from './use-me-query';
import { useServerData } from './use-server-data';

export const useAbility = () => {
  const { isLoggedIn } = useAppStore();
  const { serverId } = useServerData();

  const { data: meData } = useMeQuery({
    enabled: isLoggedIn,
  });

  const getServerAbility = () => {
    const permissions = serverId
      ? meData?.user.permissions.servers[serverId] || []
      : [];
    return createMongoAbility<ServerAbility>(permissions);
  };

  const getInstanceAbility = () => {
    const permissions = meData?.user.permissions.instance || [];
    return createMongoAbility<InstanceAbility>(permissions);
  };

  return {
    serverAbility: getServerAbility(),
    instanceAbility: getInstanceAbility(),
  };
};
