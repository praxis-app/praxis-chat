import { dataSource } from '../database/data-source';
import { Role } from '../roles/entities/role.entity';
import * as rolesService from '../roles/roles.service';
import { CreateProposalActionRoleReq } from './dtos/create-proposal-action-role-req.dto';
import { ProposalActionRoleMember } from './entities/proposal-action-role-member.entity';
import { ProposalActionRole } from './entities/proposal-action-role.entity';

const proposalActionRoleRepository =
  dataSource.getRepository(ProposalActionRole);

const rolesRepository = dataSource.getRepository(Role);

export const createProposalActionRole = async (
  proposalActionId: string,
  { roleToUpdateId, members, ...role }: CreateProposalActionRoleReq,
) => {
  const savedRole = await proposalActionRoleRepository.save({
    ...role,
    permissions: role.permissions,
    roleId: roleToUpdateId,
    proposalActionId,
  });

  if (members && members.length > 0) {
    const proposalActionRoleMemberRepository = dataSource.getRepository(
      ProposalActionRoleMember,
    );
    await proposalActionRoleMemberRepository.save(
      members.map((member) => ({
        userId: member.userId,
        changeType: member.changeType,
        proposalActionRoleId: savedRole.id,
      })),
    );
  }

  return savedRole;
};

export const implementChangeRole = async (proposalActionId: string) => {
  const actionRole = await proposalActionRoleRepository.findOneOrFail({
    where: { proposalActionId },
    relations: ['permission', 'members'],
  });
  const roleToUpdate = await rolesRepository.findOneOrFail({
    where: { id: actionRole.roleId },
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
    await rolesService.updateRolePermissions(roleToUpdate.id, {
      permissions: actionRole.permissions,
    });
  }
  // Add role members
  if (userIdsToAdd?.length) {
    await rolesService.addRoleMembers(roleToUpdate.id, userIdsToAdd);
  }
  // Remove role members
  if (userIdsToRemove?.length) {
    await rolesService.removeRoleMembers(roleToUpdate.id, userIdsToRemove);
  }
  // Update proposal action role old name and color
  if (actionRole.name || actionRole.color) {
    await proposalActionRoleRepository.update(actionRole.id, {
      oldName: actionRole.name ? roleToUpdate.name : undefined,
      oldColor: actionRole.color ? roleToUpdate.color : undefined,
    });
  }
};

export const implementCreateRole = async (proposalActionId: string) => {
  const actionRole = await proposalActionRoleRepository.findOneOrFail({
    where: { proposalActionId },
    relations: ['permission', 'members'],
  });

  const { name, color, permissions } = actionRole;
  const members = actionRole.members?.map(({ userId }) => ({ id: userId }));

  if (!name || !color || !permissions || !members) {
    throw new Error('Failed to find all required proposal action role data', {
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
