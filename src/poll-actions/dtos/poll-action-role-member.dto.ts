import { RoleAttributeChangeType } from '@common/poll-actions/poll-action.types';

export interface PollActionRoleMemberDto {
  userId: string;
  changeType: RoleAttributeChangeType;
}
