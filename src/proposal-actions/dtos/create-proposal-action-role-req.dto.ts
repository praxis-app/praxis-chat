import { CreateProposalActionRolePermissionReq } from './create-proposal-action-role-permission-req.dto';

export interface CreateProposalActionRoleReq {
  roleToUpdateId?: number;
  permissions?: CreateProposalActionRolePermissionReq[];
}
