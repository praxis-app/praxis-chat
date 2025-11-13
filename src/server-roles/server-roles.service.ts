import { RawRuleOf } from '@casl/ability';
import {
  ServerAbilityAction,
  ServerAbilitySubject,
  ServerAbility,
} from '@common/server-roles/server-ability';
import { In, Not } from 'typeorm';
import { sanitizeText } from '../common/text.utils';
import { dataSource } from '../database/data-source';
import { PollActionRole } from '../poll-actions/entities/poll-action-role.entity';
import * as serversService from '../servers/servers.service';
import { User } from '../users/user.entity';
import * as usersService from '../users/users.service';
import { ServerRolePermission } from './entities/server-role-permission.entity';
import { ServerRole } from './entities/server-role.entity';

const DEFAULT_ROLE_COLOR = '#f44336';
const ADMIN_ROLE_NAME = 'admin';

type RulesMap = Record<string, ServerAbilityAction[]>;
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

export const getServerRole = async (serverRoleId: string) => {
  const serverRole = await serverRoleRepository.findOne({
    where: { id: serverRoleId },
    relations: ['permissions'],
  });
  if (!serverRole) {
    throw new Error('Server role not found');
  }
  const members = await userRepository.find({
    where: { serverRoles: { id: serverRoleId } },
    select: ['id', 'name', 'displayName'],
  });
  const permissions = buildPermissionRules([serverRole]);

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

export const getServerRoles = async () => {
  const serverRoles = await serverRoleRepository.find({
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
    permissions: buildPermissionRules([serverRole]),
    memberCount: serverRole.members.length,
  }));
};

/** Get permissions from assigned server roles keyed by server ID */
export const getServerPermissions = async (
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
      permissionsByServerId[serverId] = buildPermissionRules(roles);
      return permissionsByServerId;
    },
    {},
  );
};

export const getUsersEligibleForServerRole = async (serverRoleId: string) => {
  const serverRole = await serverRoleRepository.findOne({
    where: { id: serverRoleId },
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

export const createServerRole = async ({
  name,
  color,
}: CreateServerRoleDto) => {
  const server = await serversService.getInitialServerSafely();
  const serverRole = await serverRoleRepository.save({ name, color, server });
  return { ...serverRole, memberCount: 0 };
};

export const createAdminServerRole = async (userId: string) => {
  const server = await serversService.getInitialServerSafely();

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
    server,
  });
};

export const updateServerRole = async (
  id: string,
  { name, color }: UpdateServerRoleDto,
) => {
  const sanitizedName = sanitizeText(name);
  const sanitizedColor = sanitizeText(color);

  return serverRoleRepository.update(id, {
    name: sanitizedName,
    color: sanitizedColor,
  });
};

export const updateServerRolePermissions = async (
  serverRoleId: string,
  { permissions }: UpdateServerRolePermissionsDto,
) => {
  const serverRole = await serverRoleRepository.findOne({
    where: { id: serverRoleId },
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
  serverRoleId: string,
  userIds: string[],
) => {
  const serverRole = await serverRoleRepository.findOne({
    where: { id: serverRoleId },
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

  const members = [...serverRole.members, ...newMembers];
  const profilePictures = await usersService.getUserProfilePicturesMap(
    members.map((member) => member.id),
  );
  const shapedMembers = members.map((member) => ({
    ...member,
    profilePicture: profilePictures[member.id],
  }));

  await serverRoleRepository.save({
    ...serverRole,
    members: shapedMembers,
  });
};

export const removeServerRoleMembers = async (
  serverRoleId: string,
  userIds: string[],
) => {
  const serverRole = await serverRoleRepository.findOne({
    where: { id: serverRoleId },
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

export const deleteServerRole = async (id: string) => {
  return serverRoleRepository.delete(id);
};

/**
 * Example output:
 * `[ { subject: 'Channel', action: ['read', 'create'] } ]`
 */
export const buildPermissionRules = (
  serverRoles: ServerRole[] | PollActionRole[],
): RawRuleOf<ServerAbility>[] => {
  const rulesMap = serverRoles.reduce<RulesMap>((result, serverRole) => {
    for (const permission of serverRole.permissions || []) {
      if (!result[permission.subject]) {
        result[permission.subject] = [];
      }
      result[permission.subject].push(permission.action);
    }
    return result;
  }, {});

  return Object.entries(rulesMap).map(([subject, action]) => ({
    subject: subject as ServerAbilitySubject,
    action,
  }));
};
