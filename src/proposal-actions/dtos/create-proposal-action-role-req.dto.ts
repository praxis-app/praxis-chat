import { CreateProposalActionRoleMemberReq } from './create-proposal-action-role-member-req.dto';
import { CreateProposalActionRolePermissionReq } from './create-proposal-action-role-permission-req.dto';

export interface CreateProposalActionRoleReq {
  name?: string;
  color?: string;
  members?: CreateProposalActionRoleMemberReq[];
  permissions?: CreateProposalActionRolePermissionReq[];
  roleToUpdateId?: string;
}
