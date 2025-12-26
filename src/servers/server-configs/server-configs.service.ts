import * as dotenv from 'dotenv';
import { dataSource } from '../../database/data-source';
import { ServerConfig } from './entities/server-config.entity';
import { ServerConfigDto } from './server-config.types';

dotenv.config();

const serverConfigRepository = dataSource.getRepository(ServerConfig);

export const getServerConfig = async (serverId: string) => {
  const serverConfig = await serverConfigRepository.findOne({
    where: { serverId },
  });
  if (!serverConfig) {
    throw new Error('Server config not found');
  }
  return serverConfig;
};

export const isAnonymousUsersEnabled = async (serverId: string) => {
  const serverConfig = await serverConfigRepository.findOne({
    where: { serverId },
    select: ['id', 'anonymousUsersEnabled'],
  });
  if (!serverConfig) {
    return null;
  }
  return serverConfig.anonymousUsersEnabled;
};

export const updateServerConfig = async (
  serverId: string,
  data: ServerConfigDto,
) => {
  const serverConfig = await getServerConfig(serverId);

  return serverConfigRepository.update(
    {
      id: serverConfig.id,
      serverId,
    },
    data,
  );
};
