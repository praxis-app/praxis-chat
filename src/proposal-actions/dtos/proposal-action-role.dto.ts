import { ProposalActionRoleMemberDto } from './proposal-action-role-member.dto';
import { ProposalActionRolePermissionDto } from './proposal-action-role-permission.dto';

export interface ProposalActionRoleDto {
  name?: string;
  color?: string;
  members?: ProposalActionRoleMemberDto[];
  permissions?: ProposalActionRolePermissionDto[];
  roleToUpdateId?: string;
}
