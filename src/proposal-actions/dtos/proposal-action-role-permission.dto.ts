import { AbilityAction, AbilitySubject } from '../../roles/app-ability';
import { RoleAttributeChangeType } from '../proposal-action.types';

export interface ProposalActionRolePermissionDto {
  subject: AbilitySubject;
  actions: { action: AbilityAction; changeType: RoleAttributeChangeType }[];
}
