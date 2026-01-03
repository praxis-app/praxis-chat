import { dataSource } from '../database/data-source';
import { Server } from '../servers/entities/server.entity';
import { createInitialServer } from '../servers/servers.service';
import { InstanceConfig } from './instance-config.entity';

const instanceConfigRepository = dataSource.getRepository(InstanceConfig);
const serverRepository = dataSource.getRepository(Server);

interface UpdateInstanceConfigDto {
  defaultServerId?: string;
}

export const getInstanceConfigSafely = async () => {
  const instanceConfigs = await instanceConfigRepository.find({
    select: ['id', 'defaultServerId'],
  });
  if (!instanceConfigs.length) {
    return initializeInstanceConfig();
  }
  return instanceConfigs[0];
};

export const updateInstanceConfig = async ({
  defaultServerId,
}: UpdateInstanceConfigDto) => {
  const instanceConfig = await getInstanceConfigSafely();
  if (!instanceConfig) {
    throw new Error('Instance config not found');
  }

  if (defaultServerId) {
    const server = await serverRepository.findOne({
      where: { id: defaultServerId },
    });
    if (!server) {
      throw new Error('Server not found');
    }
    instanceConfig.defaultServerId = defaultServerId;
  }

  return instanceConfigRepository.save(instanceConfig);
};

export const initializeInstance = async () => {
  const instanceConfigCount = await instanceConfigRepository.count();
  if (instanceConfigCount > 0) {
    return;
  }
  await initializeInstanceConfig();
  console.info('Instance initialized');
};

const initializeInstanceConfig = async () => {
  const initialServer = await createInitialServer();

  const instanceConfig = await instanceConfigRepository.save({
    defaultServerId: initialServer.id,
  });

  return {
    id: instanceConfig.id,
    defaultServerId: instanceConfig.defaultServerId,
  };
};
