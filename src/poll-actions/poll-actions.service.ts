import { In } from 'typeorm';
import { dataSource } from '../database/data-source';
import { ServerRolePermission } from '../server-roles/entities/server-role-permission.entity';
import { ServerRole } from '../server-roles/entities/server-role.entity';
import * as serverRolesService from '../server-roles/server-roles.service';
import { User } from '../users/user.entity';
import { PollActionRoleDto } from './dtos/poll-action-role.dto';
import { PollActionPermission } from './entities/poll-action-permission.entity';
import { PollActionRoleMember } from './entities/poll-action-role-member.entity';
import { PollActionRole } from './entities/poll-action-role.entity';
import { PollAction } from './entities/poll-action.entity';

const usersRepository = dataSource.getRepository(User);
const serverRolesRepository = dataSource.getRepository(ServerRole);
const serverRolePermissionRepository =
  dataSource.getRepository(ServerRolePermission);

const pollActionRepository = dataSource.getRepository(PollAction);
const pollActionRoleRepository = dataSource.getRepository(PollActionRole);

const pollActionRoleMemberRepository =
  dataSource.getRepository(PollActionRoleMember);

const pollActionPermissionRepository =
  dataSource.getRepository(PollActionPermission);

export const implementPollAction = async (pollId: string) => {
  const { id, actionType } = await pollActionRepository.findOneOrFail({
    where: { pollId },
  });

  if (actionType === 'change-role') {
    await implementChangeServerRole(id);
  }
  if (actionType === 'create-role') {
    await implementCreateServerRole(id);
  }
};

export const createPollActionRole = async (
  pollActionId: string,
  {
    serverRoleToUpdateId,
    members,
    permissions,
    ...serverRole
  }: PollActionRoleDto,
) => {
  const roleToUpdate = await serverRolesRepository.findOneOrFail({
    where: { id: serverRoleToUpdateId },
  });

  const name = serverRole.name?.trim();
  const color = serverRole.color?.trim();
  const prevName = name ? roleToUpdate.name : undefined;
  const prevColor = color ? roleToUpdate.color : undefined;

  const savedRole = await pollActionRoleRepository.save({
    serverRoleId: serverRoleToUpdateId,
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

export const implementChangeServerRole = async (pollActionId: string) => {
  const actionRole = await pollActionRoleRepository.findOneOrFail({
    where: { pollActionId },
    relations: ['permissions', 'members'],
  });
  const roleToUpdate = await serverRolesRepository.findOneOrFail({
    where: { id: actionRole.serverRoleId },
    relations: ['permissions'],
  });

  const userIdsToAdd = actionRole.members
    ?.filter(({ changeType }) => changeType === 'add')
    .map(({ userId }) => userId);

  const userIdsToRemove = actionRole.members
    ?.filter(({ changeType }) => changeType === 'remove')
    .map(({ userId }) => userId);

  // Update role itself
  await serverRolesService.updateServerRole(
    roleToUpdate.serverId,
    roleToUpdate.id,
    {
      name: actionRole.name,
      color: actionRole.color,
    },
  );
  // Update role permissions
  if (actionRole.permissions) {
    const toAdd = actionRole.permissions.filter(
      (permission) => permission.changeType === 'add',
    );
    const toRemove = actionRole.permissions.filter(
      (permission) => permission.changeType === 'remove',
    );
    if (toRemove.length > 0) {
      await serverRolePermissionRepository.remove(
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
      await serverRolePermissionRepository.save(
        toAdd.map(({ action, subject }) => ({
          serverRoleId: roleToUpdate.id,
          action,
          subject,
        })),
      );
    }
  }
  // Add role members
  if (userIdsToAdd?.length) {
    await serverRolesService.addServerRoleMembers(
      roleToUpdate.serverId,
      roleToUpdate.id,
      userIdsToAdd,
    );
  }
  // Remove role members
  if (userIdsToRemove?.length) {
    await serverRolesService.removeServerRoleMembers(
      roleToUpdate.serverId,
      roleToUpdate.id,
      userIdsToRemove,
    );
  }
  // Update poll action role old name and color
  if (actionRole.name || actionRole.color) {
    await pollActionRoleRepository.update(actionRole.id, {
      prevName: actionRole.name ? roleToUpdate.name : undefined,
      prevColor: actionRole.color ? roleToUpdate.color : undefined,
    });
  }
};

export const implementCreateServerRole = async (pollActionId: string) => {
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

  await serverRolesRepository.save({
    name,
    color,
    permissions,
    members,
  });
};
