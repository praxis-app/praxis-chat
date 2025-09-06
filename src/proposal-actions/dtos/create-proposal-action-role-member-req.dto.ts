import { RoleMemberChangeType } from '../proposal-action.types';

export interface CreateProposalActionRoleMemberReq {
  userId: string;
  changeType: RoleMemberChangeType;
}
