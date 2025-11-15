import { dataSource } from '../database/data-source';
import { getInitialServerSafely } from '../servers/servers.service';
import { InstanceConfig } from './instance-config.entity';

const instanceConfigRepository = dataSource.getRepository(InstanceConfig);

export const getInstanceConfigSafely = async () => {
  const instanceConfigs = await instanceConfigRepository.find();
  if (!instanceConfigs.length) {
    return initializeInstanceConfig();
  }
  return instanceConfigs[0];
};

const initializeInstanceConfig = async () => {
  const initialServer = await getInitialServerSafely();

  return instanceConfigRepository.save({
    defaultServerId: initialServer.id,
  });
};
