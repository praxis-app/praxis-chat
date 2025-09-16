import { RoleAttributeChangeType } from '@common/proposal-actions/proposal-action.types';
import { AbilityAction, AbilitySubject } from '../../roles/app-ability';

export interface ProposalActionRolePermissionDto {
  subject: AbilitySubject;
  actions: { action: AbilityAction; changeType: RoleAttributeChangeType }[];
}
