import { RawRuleOf } from '@casl/ability';
import {
  ADMIN_ROLE_NAME,
  DEFAULT_ROLE_COLOR,
} from '@common/roles/role.constants';
import { buildPermissionRules } from '@common/roles/role.utils';
import {
  ServerAbility,
  ServerAbilitySubject,
} from '@common/roles/server-roles/server-ability';
import { In, Not } from 'typeorm';
import { AbilityAction } from '@common/roles/role.types';
import { sanitizeText } from '../../common/text.utils';
import { dataSource } from '../../database/data-source';
import { User } from '../../users/user.entity';
import * as usersService from '../../users/users.service';
import { ServerRolePermission } from './entities/server-role-permission.entity';
import { ServerRole } from './entities/server-role.entity';

type ServerPermissionsMap = Record<string, RawRuleOf<ServerAbility>[]>;

interface CreateServerRoleDto {
  name: string;
  color: string;
}

interface UpdateServerRoleDto {
  name?: string;
  color?: string;
}

interface UpdateServerRolePermissionsDto {
  permissions: RawRuleOf<ServerAbility>[];
}

const userRepository = dataSource.getRepository(User);
const serverRoleRepository = dataSource.getRepository(ServerRole);
const serverRolePermissionRepository =
  dataSource.getRepository(ServerRolePermission);

export const getServerRole = async (serverId: string, serverRoleId: string) => {
  const serverRole = await serverRoleRepository.findOne({
    where: { id: serverRoleId, serverId },
    relations: ['permissions'],
  });
  if (!serverRole) {
    throw new Error('Server role not found');
  }
  const members = await userRepository.find({
    where: { serverRoles: { id: serverRoleId } },
    select: ['id', 'name', 'displayName'],
  });
  const permissions = buildPermissionRules<ServerAbilitySubject, AbilityAction>(
    [serverRole],
  );

  const profilePictures = await usersService.getUserProfilePicturesMap(
    members.map((member) => member.id),
  );
  const shapedMembers = members.map((member) => ({
    ...member,
    profilePicture: profilePictures[member.id],
  }));

  return {
    ...serverRole,
    permissions,
    members: shapedMembers,
    memberCount: members.length,
  };
};

export const getServerRoles = async (serverId: string) => {
  const serverRoles = await serverRoleRepository.find({
    where: { serverId },
    relations: ['members', 'permissions'],
    select: {
      id: true,
      name: true,
      color: true,
      members: {
        id: true,
        name: true,
        displayName: true,
      },
      permissions: {
        subject: true,
        action: true,
      },
    },
  });

  const profilePictures = await usersService.getUserProfilePicturesMap(
    serverRoles.flatMap((serverRole) =>
      serverRole.members.map((member) => member.id),
    ),
  );

  return serverRoles.map((serverRole) => ({
    ...serverRole,
    members: serverRole.members.map((member) => ({
      ...member,
      profilePicture: profilePictures[member.id],
    })),
    permissions: buildPermissionRules<ServerAbilitySubject, AbilityAction>([
      serverRole,
    ]),
    memberCount: serverRole.members.length,
  }));
};

/** Get permissions from assigned server roles keyed by server ID */
export const getServerPermissionsByUser = async (
  userId: string,
): Promise<ServerPermissionsMap> => {
  const serverRoles = await serverRoleRepository.find({
    relations: ['permissions'],
    where: {
      members: {
        id: userId,
      },
    },
  });

  const serverRolesByServerId = serverRoles.reduce<
    Record<string, ServerRole[]>
  >((result, serverRole) => {
    if (!serverRole.serverId) {
      return result;
    }

    if (!result[serverRole.serverId]) {
      result[serverRole.serverId] = [];
    }

    result[serverRole.serverId].push(serverRole);
    return result;
  }, {});

  return Object.entries(serverRolesByServerId).reduce<ServerPermissionsMap>(
    (permissionsByServerId, [serverId, roles]) => {
      permissionsByServerId[serverId] = buildPermissionRules<
        ServerAbilitySubject,
        AbilityAction
      >(roles);
      return permissionsByServerId;
    },
    {},
  );
};

export const getUsersEligibleForServerRole = async (
  serverId: string,
  serverRoleId: string,
) => {
  const serverRole = await serverRoleRepository.findOne({
    where: { id: serverRoleId, serverId },
    relations: ['members'],
  });
  if (!serverRole) {
    throw new Error('Server role not found');
  }

  const userIds = serverRole.members.map(({ id }) => id);
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

export const createServerRole = async (
  serverId: string,
  { name, color }: CreateServerRoleDto,
) => {
  const serverRole = await serverRoleRepository.save({
    name,
    color,
    serverId,
  });
  return { ...serverRole, memberCount: 0 };
};

export const createAdminServerRole = async (
  serverId: string,
  userId: string,
) => {
  await serverRoleRepository.save({
    name: ADMIN_ROLE_NAME,
    color: DEFAULT_ROLE_COLOR,
    permissions: [
      { subject: 'ServerConfig', action: 'manage' },
      { subject: 'Channel', action: 'manage' },
      { subject: 'Invite', action: 'create' },
      { subject: 'Invite', action: 'manage' },
      { subject: 'ServerRole', action: 'manage' },
    ],
    members: [{ id: userId }],
    serverId,
  });
};

export const updateServerRole = async (
  serverId: string,
  serverRoleId: string,
  { name, color }: UpdateServerRoleDto,
) => {
  const sanitizedName = sanitizeText(name);
  const sanitizedColor = sanitizeText(color);

  return serverRoleRepository.update(
    { id: serverRoleId, serverId },
    {
      name: sanitizedName,
      color: sanitizedColor,
    },
  );
};

export const updateServerRolePermissions = async (
  serverId: string,
  serverRoleId: string,
  { permissions }: UpdateServerRolePermissionsDto,
) => {
  const serverRole = await serverRoleRepository.findOne({
    where: { id: serverRoleId, serverId },
    relations: ['permissions'],
  });
  if (!serverRole) {
    throw new Error('Server role not found');
  }

  const permissionsToSave = permissions.reduce<Partial<ServerRolePermission>[]>(
    (result, { action, subject }) => {
      const actions = Array.isArray(action) ? action : [action];

      for (const a of actions) {
        // Account for existing permissions
        const permission = serverRole.permissions.find(
          (p) => p.subject === subject && p.action === a,
        );
        result.push({
          id: permission?.id,
          subject: subject as ServerAbilitySubject,
          action: a,
          serverRole,
        });
      }
      return result;
    },
    [],
  );

  const permissionsToDelete = serverRole.permissions.reduce<string[]>(
    (result, currentPermission) => {
      const found = permissions.find(
        (p) =>
          p.subject === currentPermission.subject &&
          p.action.includes(currentPermission.action),
      );
      if (!found) {
        result.push(currentPermission.id);
      }
      return result;
    },
    [],
  );

  if (permissionsToDelete.length) {
    await serverRolePermissionRepository.delete(permissionsToDelete);
  }
  await serverRolePermissionRepository.save(permissionsToSave);
};

export const addServerRoleMembers = async (
  serverId: string,
  serverRoleId: string,
  userIds: string[],
) => {
  const serverRole = await serverRoleRepository.findOne({
    where: { id: serverRoleId, serverId },
    relations: ['members'],
  });
  if (!serverRole) {
    throw new Error('Server role not found');
  }
  const newMembers = await userRepository.find({
    where: {
      id: In(userIds),
      anonymous: false,
      locked: false,
    },
  });

  await serverRoleRepository.save({
    ...serverRole,
    members: [...serverRole.members, ...newMembers],
  });
};

export const removeServerRoleMembers = async (
  serverId: string,
  serverRoleId: string,
  userIds: string[],
) => {
  const serverRole = await serverRoleRepository.findOne({
    where: { id: serverRoleId, serverId },
    relations: ['members'],
  });
  if (!serverRole) {
    throw new Error('Server role not found');
  }
  serverRole.members = serverRole.members.filter(
    (member) => !userIds.includes(member.id),
  );
  await serverRoleRepository.save(serverRole);
};

export const deleteServerRole = async (
  serverId: string,
  serverRoleId: string,
) => {
  return serverRoleRepository.delete({ id: serverRoleId, serverId });
};
