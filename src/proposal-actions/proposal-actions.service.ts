import { dataSource } from '../database/data-source';
import { CreateProposalActionRoleReq } from './dtos/create-proposal-action-role-req.dto';
import { ProposalActionRoleMember } from './entities/proposal-action-role-member.entity';
import { ProposalActionRole } from './entities/proposal-action-role.entity';

const proposalActionRoleRepository =
  dataSource.getRepository(ProposalActionRole);

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
