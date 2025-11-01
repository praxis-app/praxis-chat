import { AbilityAction, AbilitySubject } from '@common/roles/app-ability';
import { PERMISSION_KEYS } from '../constants/server-role.constants';
import { UserRes } from './user.types';

export type PermissionKeys = (typeof PERMISSION_KEYS)[number];

export interface Permission {
  subject: AbilitySubject;
  action: AbilityAction[];
}

// -------------------------------------------------------------------------
// Requests
// -------------------------------------------------------------------------

export interface CreateServerRoleReq {
  name: string;
  color: string;
}

export interface UpdateServerRolePermissionsReq {
  permissions: Permission[];
}

// -------------------------------------------------------------------------
// Responses
// -------------------------------------------------------------------------

export interface ServerRoleRes {
  id: string;
  name: string;
  color: string;
  permissions: Permission[];
  memberCount: number;
  members: UserRes[];
}
