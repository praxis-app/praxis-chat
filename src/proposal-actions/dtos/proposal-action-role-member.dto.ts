import { RoleMemberChangeType } from '../proposal-action.types';

export interface ProposalActionRoleMemberDto {
  userId: string;
  changeType: RoleMemberChangeType;
}
