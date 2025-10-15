// TODO: Add support for multiple chat servers per instance

import { dataSource } from '../database/data-source';
import { ServerConfig } from '../server-configs/entities/server-config.entity';
import { Server } from './entities/server.entity';

export const INITIAL_SERVER_NAME = 'praxis';

const serverRepository = dataSource.getRepository(Server);
const serverConfigRepository = dataSource.getRepository(ServerConfig);

export const getServerSafely = async () => {
  const servers = await serverRepository.find();
  if (!servers.length) {
    return createInitialServer();
  }
  return servers[0];
};

export const createInitialServer = async () => {
  const server = await serverRepository.save({
    name: INITIAL_SERVER_NAME,
  });
  await serverConfigRepository.save({
    serverId: server.id,
  });
  return server;
};
