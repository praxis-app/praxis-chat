import { In } from 'typeorm';
import { dataSource } from '../database/data-source';
import { Permission } from '../roles/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import * as rolesService from '../roles/roles.service';
import { User } from '../users/user.entity';
import { PollActionRoleDto } from './dtos/poll-action-role.dto';
import { PollActionPermission } from './entities/poll-action-permission.entity';
import { PollActionRoleMember } from './entities/poll-action-role-member.entity';
import { PollActionRole } from './entities/poll-action-role.entity';

const usersRepository = dataSource.getRepository(User);
const rolesRepository = dataSource.getRepository(Role);
const permissionRepository = dataSource.getRepository(Permission);

const pollActionRoleRepository = dataSource.getRepository(PollActionRole);

const pollActionRoleMemberRepository =
  dataSource.getRepository(PollActionRoleMember);

const pollActionPermissionRepository =
  dataSource.getRepository(PollActionPermission);

export const createPollActionRole = async (
  pollActionId: string,
  { roleToUpdateId, members, permissions, ...role }: PollActionRoleDto,
) => {
  const roleToUpdate = await rolesRepository.findOneOrFail({
    where: { id: roleToUpdateId },
  });

  const name = role.name?.trim();
  const color = role.color?.trim();
  const prevName = name ? roleToUpdate.name : undefined;
  const prevColor = color ? roleToUpdate.color : undefined;

  const savedRole = await pollActionRoleRepository.save({
    roleId: roleToUpdateId,
    name,
    color,
    prevName,
    prevColor,
    pollActionId,
  });

  if (permissions && permissions.length > 0) {
    const permissionsToSave: Partial<PollActionPermission>[] = [];
    for (const permission of permissions) {
      for (const action of permission.actions) {
        permissionsToSave.push({
          ...action,
          subject: permission.subject,
          pollActionRoleId: savedRole.id,
        });
      }
    }
    savedRole.permissions =
      await pollActionPermissionRepository.save(permissionsToSave);
  }

  if (members && members.length > 0) {
    const actionRoleMembers = await pollActionRoleMemberRepository.save(
      members.map((member) => ({
        userId: member.userId,
        changeType: member.changeType,
        pollActionRoleId: savedRole.id,
      })),
    );
    const users = await usersRepository.find({
      where: {
        id: In(actionRoleMembers.map((member) => member.userId)),
      },
      select: {
        id: true,
        name: true,
        displayName: true,
      },
    });
    savedRole.members = users.map((user) => {
      const member = actionRoleMembers.find(
        (member) => member.userId === user.id,
      );
      return {
        ...member!,
        user,
      };
    });
  }

  return savedRole;
};

export const implementChangeRole = async (pollActionId: string) => {
  const actionRole = await pollActionRoleRepository.findOneOrFail({
    where: { pollActionId },
    relations: ['permissions', 'members'],
  });
  const roleToUpdate = await rolesRepository.findOneOrFail({
    where: { id: actionRole.roleId },
    relations: ['permissions'],
  });

  const userIdsToAdd = actionRole.members
    ?.filter(({ changeType }) => changeType === 'add')
    .map(({ userId }) => userId);

  const userIdsToRemove = actionRole.members
    ?.filter(({ changeType }) => changeType === 'remove')
    .map(({ userId }) => userId);

  // Update role itself
  await rolesService.updateRole(roleToUpdate.id, {
    name: actionRole.name,
    color: actionRole.color,
  });
  // Update role permissions
  if (actionRole.permissions) {
    const toAdd = actionRole.permissions.filter(
      (permission) => permission.changeType === 'add',
    );
    const toRemove = actionRole.permissions.filter(
      (permission) => permission.changeType === 'remove',
    );
    if (toRemove.length > 0) {
      await permissionRepository.remove(
        roleToUpdate.permissions.filter((permission) =>
          toRemove.some(
            (p) =>
              p.action === permission.action &&
              p.subject === permission.subject,
          ),
        ),
      );
    }
    if (toAdd.length > 0) {
      await permissionRepository.save(
        toAdd.map(({ action, subject }) => ({
          roleId: roleToUpdate.id,
          action,
          subject,
        })),
      );
    }
  }
  // Add role members
  if (userIdsToAdd?.length) {
    await rolesService.addRoleMembers(roleToUpdate.id, userIdsToAdd);
  }
  // Remove role members
  if (userIdsToRemove?.length) {
    await rolesService.removeRoleMembers(roleToUpdate.id, userIdsToRemove);
  }
  // Update poll action role old name and color
  if (actionRole.name || actionRole.color) {
    await pollActionRoleRepository.update(actionRole.id, {
      prevName: actionRole.name ? roleToUpdate.name : undefined,
      prevColor: actionRole.color ? roleToUpdate.color : undefined,
    });
  }
};

export const implementCreateRole = async (pollActionId: string) => {
  const actionRole = await pollActionRoleRepository.findOneOrFail({
    where: { pollActionId },
    relations: ['permissions', 'members'],
  });

  const { name, color, permissions } = actionRole;
  const members = actionRole.members?.map(({ userId }) => ({ id: userId }));

  if (!name || !color || !permissions || !members) {
    throw new Error('Failed to find all required poll action role data', {
      cause: actionRole,
    });
  }

  await rolesRepository.save({
    name,
    color,
    permissions,
    members,
  });
};
