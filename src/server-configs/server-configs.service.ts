import * as dotenv from 'dotenv';
import { dataSource } from '../database/data-source';
import { ServerConfig } from './entities/server-config.entity';
import { ServerConfigDto } from './server-config.types';

dotenv.config();

const serverConfigRepository = dataSource.getRepository(ServerConfig);

export const getServerConfigSafely = async () => {
  const serverConfigs = await serverConfigRepository.find();
  if (!serverConfigs.length) {
    return initializeServerConfig();
  }
  return serverConfigs[0];
};

export const updateServerConfig = async (data: ServerConfigDto) => {
  const serverConfig = await getServerConfigSafely();
  return serverConfigRepository.update(serverConfig.id, data);
};

const initializeServerConfig = async () => {
  return serverConfigRepository.save({});
};
