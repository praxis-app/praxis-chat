import { ChangeType } from '../proposal-action.types';

export interface CreateProposalActionRoleMemberReq {
  userId: string;
  changeType: ChangeType;
}
