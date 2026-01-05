import { RoleAttributeChangeType } from '@common/poll-actions/poll-action.types';
import { AbilityAction } from '@common/roles/role.types';
import { ServerAbilitySubject } from '@common/roles/server-roles/server-ability';

export interface PollActionRolePermissionDto {
  subject: ServerAbilitySubject;
  actions: {
    action: AbilityAction;
    changeType: RoleAttributeChangeType;
  }[];
}
