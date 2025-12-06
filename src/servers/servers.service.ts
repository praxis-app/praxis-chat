import { In, IsNull, Not, QueryFailedError } from 'typeorm';
import * as channelsService from '../channels/channels.service';
import { dataSource } from '../database/data-source';
import {
  getInstanceConfigSafely,
  updateInstanceConfig,
} from '../instance/instance.service';
import { ServerConfig } from '../server-configs/entities/server-config.entity';
import * as serverRolesService from '../server-roles/server-roles.service';
import { User } from '../users/user.entity';
import * as usersService from '../users/users.service';
import { ServerMember } from './entities/server-member.entity';
import { Server } from './entities/server.entity';

export const INITIAL_SERVER_NAME = 'praxis';

const serverRepository = dataSource.getRepository(Server);
const serverConfigRepository = dataSource.getRepository(ServerConfig);
const serverMemberRepository = dataSource.getRepository(ServerMember);
const userRepository = dataSource.getRepository(User);

export const getServers = async () => {
  const instanceConfig = await getInstanceConfigSafely();
  const servers = await serverRepository.find({
    order: { createdAt: 'DESC' },
  });
  return servers.map((server) => ({
    ...server,
    isDefaultServer: server.id === instanceConfig.defaultServerId,
  }));
};

export const getServersForUser = async (userId: string) => {
  const instanceConfig = await getInstanceConfigSafely();

  const servers = await serverRepository
    .createQueryBuilder('server')
    .innerJoin('server.members', 'member', 'member.userId = :userId', {
      userId,
    })
    .orderBy('server.createdAt', 'DESC')
    .getMany();

  return servers.map((server) => ({
    ...server,
    isDefaultServer: server.id === instanceConfig.defaultServerId,
  }));
};

export const getServerById = async (serverId: string) => {
  const instanceConfig = await getInstanceConfigSafely();
  const server = await serverRepository.findOne({ where: { id: serverId } });
  if (!server) {
    throw new Error(`Server with id ${serverId} not found`);
  }
  return {
    ...server,
    isDefaultServer: server.id === instanceConfig.defaultServerId,
  };
};

export const getServerBySlug = async (slug: string) => {
  const instanceConfig = await getInstanceConfigSafely();
  const server = await serverRepository.findOne({ where: { slug } });
  if (!server) {
    throw new Error(`Server with slug ${slug} not found`);
  }
  return {
    ...server,
    isDefaultServer: server.id === instanceConfig.defaultServerId,
  };
};

export const getServerByInviteToken = async (inviteToken: string) => {
  const server = await serverRepository.findOne({
    where: { invites: { token: inviteToken } },
  });
  if (!server) {
    throw new Error(`Server with invite token ${inviteToken} not found`);
  }
  return server;
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

export const getCurrentServer = async (userId: string) => {
  const server = await serverRepository.findOne({
    where: { members: { userId, lastActiveAt: Not(IsNull()) } },
    order: { members: { lastActiveAt: 'DESC' } },
    relations: ['members'],
    select: ['id', 'slug'],
  });

  if (!server) {
    const servers = await getServersForUser(userId);
    if (servers.length === 0) {
      return null;
    }

    let server = servers.find((server) => server.isDefaultServer);
    server = server || servers[0];

    return {
      id: server.id,
      slug: server.slug,
    };
  }
  return {
    id: server.id,
    slug: server.slug,
  };
};

export const getServerMembers = async (serverId: string) => {
  const members = await serverMemberRepository.find({
    where: { serverId },
    relations: ['user'],
    order: { createdAt: 'ASC' },
  });

  if (!members.length) {
    return [];
  }

  const users = members.map((member) => member.user);
  const profilePictures = await usersService.getUserProfilePicturesMap(
    users.map((user) => user.id),
  );

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    displayName: user.displayName,
    profilePicture: profilePictures[user.id],
  }));
};

export const getUsersEligibleForServer = async (serverId: string) => {
  const server = await serverRepository.findOne({
    where: { id: serverId },
    relations: ['members'],
  });
  if (!server) {
    throw new Error('Server not found');
  }

  const userIds = server.members.map(({ userId }) => userId);
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
  isDefaultServer?: boolean,
) => {
  const server = await serverRepository.save({
    name,
    slug,
    description,
    members: [{ userId: currentUserId }],
    config: serverConfigRepository.create(),
  });
  await serverRolesService.createAdminServerRole(server.id, currentUserId);
  await channelsService.initializeGeneralChannel(server.id);

  if (isDefaultServer) {
    const instanceConfig = await updateInstanceConfig({
      defaultServerId: server.id,
    });
    return {
      ...server,
      isDefaultServer: server.id === instanceConfig.defaultServerId,
    };
  }

  return {
    ...server,
    isDefaultServer: false,
  };
};

export const updateServer = async (
  serverId: string,
  name: string,
  slug: string,
  description: string | undefined,
  isDefaultServer?: boolean,
) => {
  const server = await serverRepository.findOne({
    where: { id: serverId },
  });
  if (!server) {
    throw new Error(`Server with id ${serverId} not found`);
  }

  const updatedServer = await serverRepository.save({
    ...server,
    name,
    slug,
    description,
  });

  if (isDefaultServer) {
    const instanceConfig = await updateInstanceConfig({
      defaultServerId: updatedServer.id,
    });
    return {
      ...updatedServer,
      isDefaultServer: updatedServer.id === instanceConfig.defaultServerId,
    };
  }

  const instanceConfig = await getInstanceConfigSafely();

  return {
    ...updatedServer,
    isDefaultServer: updatedServer.id === instanceConfig.defaultServerId,
  };
};

export const deleteServer = async (serverId: string) => {
  const server = await serverRepository.findOne({ where: { id: serverId } });
  if (!server) {
    throw new Error(`Server with id ${serverId} not found`);
  }
  const serverCount = await serverRepository.count();
  if (serverCount === 1) {
    throw new Error('There must be at least one server per instance');
  }
  const instanceConfig = await getInstanceConfigSafely();
  if (server.id === instanceConfig.defaultServerId) {
    throw new Error('The default server cannot be deleted');
  }
  return serverRepository.delete(serverId);
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
  const shapedNewMembers = newMembers.map((member) => ({
    userId: member.id,
    serverId,
  }));
  const members = [...server.members, ...shapedNewMembers];

  // Update server with new members
  await serverRepository.save({
    ...server,
    members,
  });

  // Add new members to all server channels
  for (const userId of userIds) {
    await channelsService.addMemberToAllServerChannels(userId, serverId);
  }
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

  // Remove members from server
  await serverMemberRepository.delete({
    serverId,
    userId: In(userIds),
  });

  // Remove members from all server channels
  for (const userId of userIds) {
    await channelsService.removeMemberFromAllServerChannels(userId, serverId);
  }
};
