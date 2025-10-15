// TODO: Add support for multiple chat servers per instance

import * as channelsService from '../channels/channels.service';
import { dataSource } from '../database/data-source';
import { ServerConfig } from '../server-configs/entities/server-config.entity';
import { ServerMember } from './entities/server-member.entity';
import { Server } from './entities/server.entity';

export const INITIAL_SERVER_NAME = 'praxis';

const serverRepository = dataSource.getRepository(Server);
const serverConfigRepository = dataSource.getRepository(ServerConfig);
const serverMemberRepository = dataSource.getRepository(ServerMember);

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

export const addMemberToServer = async (userId: string) => {
  const server = await getServerSafely();
  await serverMemberRepository.save({
    serverId: server.id,
    userId,
  });
  await channelsService.addMemberToAllServerChannels(userId, server.id);
};
