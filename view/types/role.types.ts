import {
  InstanceAbilityAction,
  InstanceAbilitySubject,
} from '@common/instance-roles/instance-ability';
import {
  ServerAbilityAction,
  ServerAbilitySubject,
} from '@common/server-roles/server-ability';
import { PERMISSION_KEYS } from '../constants/server-role.constants';
import { UserRes } from './user.types';

export type PermissionKeys = (typeof PERMISSION_KEYS)[number];

export interface ServerPermission {
  subject: ServerAbilitySubject;
  action: ServerAbilityAction[];
}

export interface InstancePermission {
  subject: InstanceAbilitySubject;
  action: InstanceAbilityAction[];
}

// -------------------------------------------------------------------------
// Requests
// -------------------------------------------------------------------------

export interface CreateServerRoleReq {
  name: string;
  color: string;
}

export interface UpdateServerRolePermissionsReq {
  permissions: ServerPermission[];
}

// -------------------------------------------------------------------------
// Responses
// -------------------------------------------------------------------------

export interface ServerRoleRes {
  id: string;
  name: string;
  color: string;
  permissions: ServerPermission[];
  memberCount: number;
  members: UserRes[];
}
