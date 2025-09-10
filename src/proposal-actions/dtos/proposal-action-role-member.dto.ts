import { RoleAttributeChangeType } from '../proposal-action.types';

export interface ProposalActionRoleMemberDto {
  userId: string;
  changeType: RoleAttributeChangeType;
}
