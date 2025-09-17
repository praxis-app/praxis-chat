import { RoleAttributeChangeType } from '@common/proposal-actions/proposal-action.types';

export interface ProposalActionRoleMemberDto {
  userId: string;
  changeType: RoleAttributeChangeType;
}
