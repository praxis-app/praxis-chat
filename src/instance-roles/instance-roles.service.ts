import { RawRuleOf } from '@casl/ability';
import { In, Not } from 'typeorm';
import {
  InstanceAbility,
  InstanceAbilityAction,
  InstanceAbilitySubject,
} from '../../common/instance-roles/instance-ability';
import { sanitizeText } from '../common/text.utils';
import { dataSource } from '../database/data-source';
import { PollActionRole } from '../poll-actions/entities/poll-action-role.entity';
import { User } from '../users/user.entity';
import * as usersService from '../users/users.service';
import { InstanceRolePermission } from './instance-role-permission.entity';
import { InstanceRole } from './instance-role.entity';

// TODO: Move to src/common
const DEFAULT_ROLE_COLOR = '#f44336';
const ADMIN_ROLE_NAME = 'admin';

type PermissionMap = Record<string, InstanceAbilityAction[]>;

interface CreateInstanceRoleDto {
  name: string;
  color: string;
}

interface UpdateInstanceRoleDto {
  name?: string;
  color?: string;
}

interface UpdateInstanceRolePermissionsDto {
  permissions: RawRuleOf<InstanceAbility>[];
}

const userRepository = dataSource.getRepository(User);
const instanceRoleRepository = dataSource.getRepository(InstanceRole);
const instanceRolePermissionRepository = dataSource.getRepository(
  InstanceRolePermission,
);

export const getInstanceRole = async (instanceRoleId: string) => {
  const instanceRole = await instanceRoleRepository.findOne({
    where: { id: instanceRoleId },
    relations: ['permissions'],
  });
  if (!instanceRole) {
    throw new Error('Instance role not found');
  }
  const members = await userRepository.find({
    where: { instanceRoles: { id: instanceRoleId } },
    select: ['id', 'name', 'displayName'],
  });
  const permissions = buildPermissionRules([instanceRole]);

  const profilePictures = await usersService.getUserProfilePicturesMap(
    members.map((member) => member.id),
  );
  const shapedMembers = members.map((member) => ({
    ...member,
    profilePicture: profilePictures[member.id],
  }));

  return {
    ...instanceRole,
    permissions,
    members: shapedMembers,
    memberCount: members.length,
  };
};

export const getInstanceRoles = async () => {
  const instanceRoles = await instanceRoleRepository.find({
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
    instanceRoles.flatMap((instanceRole) =>
      instanceRole.members.map((member) => member.id),
    ),
  );

  return instanceRoles.map((instanceRole) => ({
    ...instanceRole,
    members: instanceRole.members.map((member) => ({
      ...member,
      profilePicture: profilePictures[member.id],
    })),
    permissions: buildPermissionRules([instanceRole]),
    memberCount: instanceRole.members.length,
  }));
};

/** Get permissions from assigned roles */
export const getUserPermissions = async (
  userId: string,
): Promise<RawRuleOf<InstanceAbility>[]> => {
  const instanceRoles = await instanceRoleRepository.find({
    relations: ['permissions'],
    where: {
      members: {
        id: userId,
      },
    },
  });
  return buildPermissionRules(instanceRoles);
};

export const getUsersEligibleForInstanceRole = async (
  instanceRoleId: string,
) => {
  const instanceRole = await instanceRoleRepository.findOne({
    where: { id: instanceRoleId },
    relations: ['members'],
  });
  if (!instanceRole) {
    throw new Error('Instance role not found');
  }

  const userIds = instanceRole.members.map(({ id }) => id);
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

export const createInstanceRole = async ({
  name,
  color,
}: CreateInstanceRoleDto) => {
  const instanceRole = await instanceRoleRepository.save({ name, color });
  return { ...instanceRole, memberCount: 0 };
};

export const createAdminInstanceRole = async (userId: string) => {
  await instanceRoleRepository.save({
    name: ADMIN_ROLE_NAME,
    color: DEFAULT_ROLE_COLOR,
    permissions: [
      { subject: 'InstanceRole', action: 'manage' },
      { subject: 'Server', action: 'manage' },
      { subject: 'all', action: 'manage' },
    ],
    members: [{ id: userId }],
  });
};

export const updateInstanceRole = async (
  id: string,
  { name, color }: UpdateInstanceRoleDto,
) => {
  const sanitizedName = sanitizeText(name);
  const sanitizedColor = sanitizeText(color);

  return instanceRoleRepository.update(id, {
    name: sanitizedName,
    color: sanitizedColor,
  });
};

export const updateInstanceRolePermissions = async (
  instanceRoleId: string,
  { permissions }: UpdateInstanceRolePermissionsDto,
) => {
  const instanceRole = await instanceRoleRepository.findOne({
    where: { id: instanceRoleId },
    relations: ['permissions'],
  });
  if (!instanceRole) {
    throw new Error('Instance role not found');
  }

  const permissionsToSave = permissions.reduce<
    Partial<InstanceRolePermission>[]
  >((result, { action, subject }) => {
    const actions = Array.isArray(action) ? action : [action];

    for (const a of actions) {
      // Account for existing permissions
      const permission = instanceRole.permissions.find(
        (p) => p.subject === subject && p.action === a,
      );
      result.push({
        id: permission?.id,
        subject: subject as InstanceAbilitySubject,
        action: a,
        instanceRole,
      });
    }
    return result;
  }, []);

  const permissionsToDelete = instanceRole.permissions.reduce<string[]>(
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
    await instanceRolePermissionRepository.delete(permissionsToDelete);
  }
  await instanceRolePermissionRepository.save(permissionsToSave);
};

export const addInstanceRoleMembers = async (
  instanceRoleId: string,
  userIds: string[],
) => {
  const instanceRole = await instanceRoleRepository.findOne({
    where: { id: instanceRoleId },
    relations: ['members'],
  });
  if (!instanceRole) {
    throw new Error('Instance role not found');
  }
  const newMembers = await userRepository.find({
    where: {
      id: In(userIds),
      anonymous: false,
      locked: false,
    },
  });

  const members = [...instanceRole.members, ...newMembers];
  const profilePictures = await usersService.getUserProfilePicturesMap(
    members.map((member) => member.id),
  );
  const shapedMembers = members.map((member) => ({
    ...member,
    profilePicture: profilePictures[member.id],
  }));

  await instanceRoleRepository.save({
    ...instanceRole,
    members: shapedMembers,
  });
};

export const removeInstanceRoleMembers = async (
  instanceRoleId: string,
  userIds: string[],
) => {
  const instanceRole = await instanceRoleRepository.findOne({
    where: { id: instanceRoleId },
    relations: ['members'],
  });
  if (!instanceRole) {
    throw new Error('Instance role not found');
  }
  instanceRole.members = instanceRole.members.filter(
    (member) => !userIds.includes(member.id),
  );
  await instanceRoleRepository.save(instanceRole);
};

export const deleteInstanceRole = async (id: string) => {
  return instanceRoleRepository.delete(id);
};

/**
 * Example output:
 * `[ { subject: 'Channel', action: ['read', 'create'] } ]`
 */
export const buildPermissionRules = (
  instanceRoles: InstanceRole[] | PollActionRole[],
): RawRuleOf<InstanceAbility>[] => {
  const permissionMap = instanceRoles.reduce<PermissionMap>(
    (result, instanceRole) => {
      for (const permission of instanceRole.permissions || []) {
        if (!result[permission.subject]) {
          result[permission.subject] = [];
        }
        result[permission.subject].push(permission.action);
      }
      return result;
    },
    {},
  );

  return Object.entries(permissionMap).map(([subject, action]) => ({
    subject: subject as InstanceAbilitySubject,
    action,
  }));
};
