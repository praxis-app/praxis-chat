import * as dotenv from 'dotenv';
import { dataSource } from '../database/data-source';
import { ServerConfig } from './entities/server-config.entity';
import { ServerConfigDto } from './server-config.types';

dotenv.config();

const serverConfigRepository = dataSource.getRepository(ServerConfig);

export const getServerConfig = async (serverId: string) => {
  return serverConfigRepository.findOne({ where: { serverId } });
};

export const getServerConfigSafely = async () => {
  const serverConfigs = await serverConfigRepository.find();
  if (!serverConfigs.length) {
    return initializeServerConfig();
  }
  return serverConfigs[0];
};

export const updateServerConfig = async (
  serverId: string,
  data: ServerConfigDto,
) => {
  const serverConfig = await getServerConfig(serverId);
  if (!serverConfig) {
    throw new Error('Server config not found');
  }
  return serverConfigRepository.update(
    {
      id: serverConfig.id,
      serverId,
    },
    data,
  );
};

const initializeServerConfig = async () => {
  return serverConfigRepository.save({});
};
