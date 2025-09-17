import * as dotenv from 'dotenv';
import { dataSource } from '../database/data-source';
import { ServerConfig } from './entities/server-config.entity';

dotenv.config();

const serverConfigRepository = dataSource.getRepository(ServerConfig);

export const getServerConfig = async () => {
  const serverConfigs = await serverConfigRepository.find();
  if (!serverConfigs.length) {
    return initializeServerConfig();
  }
  return serverConfigs[0];
};

export const initializeServerConfig = async () => {
  return serverConfigRepository.save({});
};

export const updateServerConfig = async (
  data: Partial<
    Pick<
      ServerConfig,
      | 'decisionMakingModel'
      | 'standAsidesLimit'
      | 'reservationsLimit'
      | 'ratificationThreshold'
      | 'votingTimeLimit'
    >
  >,
) => {
  const serverConfig = await getServerConfig();
  return serverConfigRepository.update(serverConfig.id, data);
};
