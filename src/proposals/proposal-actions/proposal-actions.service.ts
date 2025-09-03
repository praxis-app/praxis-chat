import { dataSource } from '../../database/data-source';
import { CreateProposalActionReq } from './models/dtos/create-proposal-action-req.dto';
import { ProposalActionRole } from './models/proposal-action-role.entity';

const proposalActionRoleRepository =
  dataSource.getRepository(ProposalActionRole);

export const createProposalActionRole = async (
  proposalActionId: number,
  { roleToUpdateId, ...role }: CreateProposalActionReq,
) => {
  await proposalActionRoleRepository.save({
    ...role,
    permissions: role.permissions,
    roleId: roleToUpdateId,
    proposalActionId,
  });
};
