import { InstanceAbilitySubject } from '@common/roles/instance-roles/instance-ability';
import { RoleAbilityAction } from '@common/roles/role.types';
import { ServerAbilitySubject } from '@common/roles/server-roles/server-ability';
import {
  INSTANCE_PERMISSION_KEYS,
  SERVER_PERMISSION_KEYS,
} from '../constants/role.constants';
import { UserRes } from './user.types';

export type ServerPermissionKeys = (typeof SERVER_PERMISSION_KEYS)[number];
export type InstancePermissionKeys = (typeof INSTANCE_PERMISSION_KEYS)[number];

export interface ServerPermission {
  subject: ServerAbilitySubject;
  action: RoleAbilityAction[];
}

export interface InstancePermission {
  subject: InstanceAbilitySubject;
  action: RoleAbilityAction[];
}

// -------------------------------------------------------------------------
// Requests
// -------------------------------------------------------------------------

export interface CreateRoleReq {
  name: string;
  color: string;
}

export interface UpdateServerRolePermissionsReq {
  permissions: ServerPermission[];
}

export interface UpdateInstanceRolePermissionsReq {
  permissions: InstancePermission[];
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

export interface InstanceRoleRes {
  id: string;
  name: string;
  color: string;
  permissions: InstancePermission[];
  memberCount: number;
  members: UserRes[];
}
