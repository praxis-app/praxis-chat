import { PollActionRoleMemberDto } from './poll-action-role-member.dto';
import { PollActionRolePermissionDto } from './poll-action-role-permission.dto';

export interface PollActionRoleDto {
  name?: string;
  color?: string;
  members?: PollActionRoleMemberDto[];
  permissions?: PollActionRolePermissionDto[];
  serverRoleToUpdateId?: string;
}
