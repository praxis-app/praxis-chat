import { RoleAttributeChangeType } from '@common/poll-actions/poll-action.types';
import {
  ServerAbilityAction,
  ServerAbilitySubject,
} from '@common/server-roles/server-ability';

export interface PollActionRolePermissionDto {
  subject: ServerAbilitySubject;
  actions: {
    action: ServerAbilityAction;
    changeType: RoleAttributeChangeType;
  }[];
}
