// TODO: Add support for multiple chat servers per instance

import { dataSource } from '../database/data-source';
import { Server } from './server.entity';

export const INITIAL_SERVER_NAME = 'praxis';

const serverRepository = dataSource.getRepository(Server);

export const getServerSafely = async () => {
  const servers = await serverRepository.find();
  if (!servers.length) {
    return createInitialServer();
  }
  return servers[0];
};

export const createInitialServer = async () => {
  return serverRepository.save({
    name: INITIAL_SERVER_NAME,
  });
};
