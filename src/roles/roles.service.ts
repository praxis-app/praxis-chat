import { RawRuleOf } from '@casl/ability';
import {
  AbilityAction,
  AbilitySubject,
  AppAbility,
} from '@common/roles/app-ability';
import { In, Not } from 'typeorm';
import { sanitizeText } from '../common/common.utils';
import { dataSource } from '../database/data-source';
import { ProposalActionRole } from '../proposal-actions/entities/proposal-action-role.entity';
import { User } from '../users/user.entity';
import * as usersService from '../users/users.service';
import { CHANNEL_ACCESS_MAP } from './channel-access';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';

const DEFAULT_ROLE_COLOR = '#f44336';
const ADMIN_ROLE_NAME = 'admin';

type PermissionMap = Record<string, AbilityAction[]>;

interface CreateRoleDto {
  name: string;
  color: string;
}

interface UpdateRoleDto {
  name?: string;
  color?: string;
}

interface UpdateRolePermissionsDto {
  permissions: RawRuleOf<AppAbility>[];
}

const userRepository = dataSource.getRepository(User);
const roleRepository = dataSource.getRepository(Role);
const permissionRepository = dataSource.getRepository(Permission);

export const getRole = async (roleId: string) => {
  const role = await roleRepository.findOne({
    where: { id: roleId },
    relations: ['permissions'],
  });
  if (!role) {
    throw new Error('Role not found');
  }
  const members = await userRepository.find({
    where: { roles: { id: roleId } },
    select: ['id', 'name', 'displayName'],
  });
  const permissions = buildPermissionRules([role]);

  const profilePictures = await usersService.getUserProfilePicturesMap(
    members.map((member) => member.id),
  );
  const shapedMembers = members.map((member) => ({
    ...member,
    profilePicture: profilePictures[member.id],
  }));

  return {
    ...role,
    permissions,
    members: shapedMembers,
    memberCount: members.length,
  };
};

export const getRoles = async () => {
  const roles = await roleRepository.find({
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
    roles.flatMap((role) => role.members.map((member) => member.id)),
  );

  return roles.map((role) => ({
    ...role,
    members: role.members.map((member) => ({
      ...member,
      profilePicture: profilePictures[member.id],
    })),
    permissions: buildPermissionRules([role]),
    memberCount: role.members.length,
  }));
};

/** Get permissions from assigned roles */
export const getUserPermissions = async (
  userId: string,
): Promise<RawRuleOf<AppAbility>[]> => {
  const roles = await roleRepository.find({
    relations: ['permissions'],
    where: {
      members: {
        id: userId,
      },
    },
  });
  return buildPermissionRules(roles);
};

export const getUsersEligibleForRole = async (roleId: string) => {
  const role = await roleRepository.findOne({
    where: { id: roleId },
    relations: ['members'],
  });
  if (!role) {
    throw new Error('Role not found');
  }

  const userIds = role.members.map(({ id }) => id);
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

export const createRole = async ({ name, color }: CreateRoleDto) => {
  const role = await roleRepository.save({ name, color });
  return { ...role, memberCount: 0 };
};

export const createAdminRole = async (userId: string) => {
  await roleRepository.save({
    name: ADMIN_ROLE_NAME,
    color: DEFAULT_ROLE_COLOR,
    members: [{ id: userId }],
    permissions: [
      { subject: 'ServerConfig', action: 'manage' },
      { subject: 'Channel', action: 'manage' },
      { subject: 'Invite', action: 'create' },
      { subject: 'Invite', action: 'manage' },
      { subject: 'Role', action: 'manage' },
    ],
  });
};

export const updateRole = async (
  id: string,
  { name, color }: UpdateRoleDto,
) => {
  const sanitizedName = sanitizeText(name);
  const sanitizedColor = sanitizeText(color);

  return roleRepository.update(id, {
    name: sanitizedName,
    color: sanitizedColor,
  });
};

export const updateRolePermissions = async (
  roleId: string,
  { permissions }: UpdateRolePermissionsDto,
) => {
  const role = await roleRepository.findOne({
    where: { id: roleId },
    relations: ['permissions'],
  });
  if (!role) {
    throw new Error('Role not found');
  }

  const permissionsToSave = permissions.reduce<Partial<Permission>[]>(
    (result, { action, subject }) => {
      const actions = Array.isArray(action) ? action : [action];

      for (const a of actions) {
        // Account for existing permissions
        const permission = role.permissions.find(
          (p) => p.subject === subject && p.action === a,
        );
        result.push({
          id: permission?.id,
          subject: subject as AbilitySubject,
          action: a,
          role,
        });
      }
      return result;
    },
    [],
  );

  const permissionsToDelete = role.permissions.reduce<string[]>(
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
    await permissionRepository.delete(permissionsToDelete);
  }
  await permissionRepository.save(permissionsToSave);
};

export const addRoleMembers = async (roleId: string, userIds: string[]) => {
  const role = await roleRepository.findOne({
    where: { id: roleId },
    relations: ['members'],
  });
  if (!role) {
    throw new Error('Role not found');
  }
  const newMembers = await userRepository.find({
    where: {
      id: In(userIds),
      anonymous: false,
      locked: false,
    },
  });

  const members = [...role.members, ...newMembers];
  const profilePictures = await usersService.getUserProfilePicturesMap(
    members.map((member) => member.id),
  );
  const shapedMembers = members.map((member) => ({
    ...member,
    profilePicture: profilePictures[member.id],
  }));

  await roleRepository.save({
    ...role,
    members: shapedMembers,
  });
};

export const removeRoleMembers = async (roleId: string, userIds: string[]) => {
  const role = await roleRepository.findOne({
    where: { id: roleId },
    relations: ['members'],
  });
  if (!role) {
    throw new Error('Role not found');
  }
  role.members = role.members.filter((member) => !userIds.includes(member.id));
  await roleRepository.save(role);
};

export const deleteRole = async (id: string) => {
  return roleRepository.delete(id);
};

/**
 * Example output:
 * `[ { subject: 'Channel', action: ['read', 'create'] } ]`
 */
export const buildPermissionRules = (
  roles: Role[] | ProposalActionRole[],
): RawRuleOf<AppAbility>[] => {
  const permissionMap = roles.reduce<PermissionMap>((result, role) => {
    for (const permission of role.permissions || []) {
      if (!result[permission.subject]) {
        result[permission.subject] = [];
      }
      result[permission.subject].push(permission.action);
    }
    return result;
  }, {});

  return Object.entries(permissionMap).map(([subject, action]) => ({
    subject: subject as AbilitySubject,
    action,
  }));
};

/** Check if a user can access a given pub-sub channel */
export const canAccessChannel = (channelKey: string, user: User) => {
  for (const { pattern, rules } of Object.values(CHANNEL_ACCESS_MAP)) {
    const match = pattern.exec(channelKey);
    if (match) {
      return Object.values(rules).every((rule) => rule(match, user));
    }
  }
  return false;
};
