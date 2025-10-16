import { RoleAttributeChangeType } from '@common/poll-actions/poll-action.types';
import { AbilityAction, AbilitySubject } from '@common/roles/app-ability';

export interface PollActionRolePermissionDto {
  subject: AbilitySubject;
  actions: { action: AbilityAction; changeType: RoleAttributeChangeType }[];
}
