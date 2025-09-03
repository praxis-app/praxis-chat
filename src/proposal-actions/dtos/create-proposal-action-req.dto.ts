import { AbilitySubject } from '../../roles/app-ability';

export interface CreateProposalActionReq {
  roleToUpdateId?: number;
  permissions?: AbilitySubject[];
}
