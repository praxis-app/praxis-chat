import { In, Not, QueryFailedError } from 'typeorm';
import * as channelsService from '../channels/channels.service';
import { dataSource } from '../database/data-source';
import { getInstanceConfigSafely } from '../instance/instance.service';
import { ServerConfig } from '../server-configs/entities/server-config.entity';
import { User } from '../users/user.entity';
import { ServerMember } from './entities/server-member.entity';
import { Server } from './entities/server.entity';
import * as usersService from '../users/users.service';

export const INITIAL_SERVER_NAME = 'praxis';

const serverRepository = dataSource.getRepository(Server);
const serverConfigRepository = dataSource.getRepository(ServerConfig);
const serverMemberRepository = dataSource.getRepository(ServerMember);
const userRepository = dataSource.getRepository(User);

export const getServers = async () => {
  return serverRepository.find({
    order: { createdAt: 'DESC' },
  });
};

export const getDefaultServer = async () => {
  const instanceConfig = await getInstanceConfigSafely();

  const server = await serverRepository.findOne({
    where: { id: instanceConfig.defaultServerId },
  });
  if (!server) {
    throw new Error('Default server not found');
  }
  return server;
};

export const getUsersEligibleForServer = async (serverId: string) => {
  const server = await serverRepository.findOne({
    where: { id: serverId },
    relations: ['members'],
  });
  if (!server) {
    throw new Error('Server not found');
  }

  const userIds = server.members.map(({ id }) => id);
  const users = await userRepository.find({
    where: {
      id: Not(In(userIds)),
      anonymous: false,
      locked: false,
    },
    select: ['id', 'name', 'displayName'],
  });
  if (users.length === 0) {
    return [];
  }

  const profilePictures = await usersService.getUserProfilePicturesMap(
    users.map((user) => user.id),
  );
  const shapedUsers = users.map((user) => ({
    ...user,
    profilePicture: profilePictures[user.id],
  }));

  return shapedUsers;
};

export const createServer = async (
  name: string,
  slug: string,
  description: string | undefined,
  currentUserId: string,
) => {
  const server = await serverRepository.save({
    name,
    slug,
    description,
    members: [{ userId: currentUserId }],
    config: serverConfigRepository.create(),
  });
  await channelsService.initializeGeneralChannel(server.id);
  return server;
};

export const updateServer = async (
  serverId: string,
  name: string,
  slug: string,
  description: string | undefined,
) => {
  const server = await serverRepository.findOne({ where: { id: serverId } });
  if (!server) {
    throw new Error(`Server with id ${serverId} not found`);
  }
  return serverRepository.update(serverId, {
    name,
    slug,
    description,
  });
};

export const deleteServer = async (serverId: string) => {
  const server = await serverRepository.findOne({ where: { id: serverId } });
  if (!server) {
    throw new Error(`Server with id ${serverId} not found`);
  }
  return serverRepository.delete(serverId);
};

export const getServerById = async (serverId: string) => {
  const server = await serverRepository.findOne({ where: { id: serverId } });
  if (!server) {
    throw new Error(`Server with id ${serverId} not found`);
  }
  return server;
};

export const getServerBySlug = async (slug: string) => {
  const server = await serverRepository.findOne({ where: { slug } });
  if (!server) {
    throw new Error(`Server with slug ${slug} not found`);
  }
  return server;
};

export const createInitialServer = async () => {
  try {
    const server = await serverRepository.save({
      name: INITIAL_SERVER_NAME,
      slug: INITIAL_SERVER_NAME,
    });
    await serverConfigRepository.save({
      serverId: server.id,
    });
    await channelsService.initializeGeneralChannel(server.id);
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

export const addMemberToServer = async (serverId: string, userId: string) => {
  await serverMemberRepository.save({
    lastActiveAt: new Date(),
    serverId,
    userId,
  });
  await channelsService.addMemberToAllServerChannels(userId, serverId);
};

export const addServerMembers = async (serverId: string, userIds: string[]) => {
  const server = await serverRepository.findOne({
    where: { id: serverId },
    relations: ['members'],
  });
  if (!server) {
    throw new Error('Server not found');
  }
  const newMembers = await userRepository.find({
    where: {
      id: In(userIds),
      anonymous: false,
      locked: false,
    },
  });
  const members = [...server.members, ...newMembers];

  await serverRepository.save({
    ...server,
    members,
  });
};

export const removeServerMembers = async (
  serverId: string,
  userIds: string[],
) => {
  const server = await serverRepository.findOne({
    where: { id: serverId },
    relations: ['members'],
  });
  if (!server) {
    throw new Error('Server not found');
  }
  server.members = server.members.filter(
    (member) => !userIds.includes(member.id),
  );
  await serverRepository.save(server);
};
