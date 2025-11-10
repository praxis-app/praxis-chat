import {
  ServerAbilityAction,
  ServerAbilitySubject,
} from '@common/server-roles/server-ability';
import { PERMISSION_KEYS } from '../constants/server-role.constants';
import { UserRes } from './user.types';

export type PermissionKeys = (typeof PERMISSION_KEYS)[number];

export interface Permission {
  subject: ServerAbilitySubject;
  action: ServerAbilityAction[];
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
