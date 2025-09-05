import { AbilityAction, AbilitySubject } from '../../roles/app-ability';

export interface CreateProposalActionRolePermissionReq {
  subject: AbilitySubject;
  actions: AbilityAction[];
}
