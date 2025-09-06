import { AbilityAction, AbilitySubject } from '../../roles/app-ability';

export interface ProposalActionRolePermissionDto {
  subject: AbilitySubject;
  actions: AbilityAction[];
}
