// TODO: Add support for multiple chat servers per instance

import { QueryFailedError } from 'typeorm';
import * as channelsService from '../channels/channels.service';
import { dataSource } from '../database/data-source';
import { ServerConfig } from '../server-configs/entities/server-config.entity';
import { ServerMember } from './entities/server-member.entity';
import { Server } from './entities/server.entity';

export const INITIAL_SERVER_NAME = 'praxis';

const serverRepository = dataSource.getRepository(Server);
const serverConfigRepository = dataSource.getRepository(ServerConfig);
const serverMemberRepository = dataSource.getRepository(ServerMember);

export const getServers = async () => {
  return serverRepository.find({
    order: { createdAt: 'ASC' },
  });
};

export const getServerBySlug = async (slug: string) => {
  const server = await serverRepository.findOne({ where: { slug } });
  if (!server) {
    throw new Error(`Server with slug ${slug} not found`);
  }
  return server;
};

export const getInitialServerSafely = async () => {
  const servers = await getServers();
  if (!servers.length) {
    return createInitialServer();
  }
  return servers[0];
};

export const createInitialServer = async () => {
  try {
    const server = await serverRepository.save({
      name: INITIAL_SERVER_NAME,
    });
    await serverConfigRepository.save({
      serverId: server.id,
    });
    return server;
  } catch (error) {
    // Handle race condition: if another request created the server concurrently,
    // the duplicate key error will be thrown. In this case, fetch and return
    // the server that was just created by the other request
    if (
      error instanceof QueryFailedError &&
      error.driverError?.message.includes('duplicate key')
    ) {
      const existingServer = await serverRepository.findOne({
        where: { name: INITIAL_SERVER_NAME },
      });
      if (existingServer) {
        return existingServer;
      }
    }
    throw error;
  }
};

export const addMemberToServer = async (userId: string) => {
  const server = await getInitialServerSafely();
  await serverMemberRepository.save({
    serverId: server.id,
    userId,
  });
  await channelsService.addMemberToAllServerChannels(userId, server.id);
};
