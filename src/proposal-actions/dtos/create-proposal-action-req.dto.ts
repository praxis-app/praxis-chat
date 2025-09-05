import { ProposalActionType } from '../../proposals/proposal.types';
import { CreateProposalActionRoleReq } from './create-proposal-action-role-req.dto';

export interface CreateProposalActionReq {
  actionType: ProposalActionType;
  role?: CreateProposalActionRoleReq;
}
