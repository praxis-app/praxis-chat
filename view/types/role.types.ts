import { ForcedSubject, MongoAbility } from '@casl/ability';
import {
  ABILITY_ACTIONS,
  ABILITY_SUBJECTS,
} from '@common/roles/role.constants';
import { PERMISSION_KEYS } from '../constants/role.constants';
import { UserRes } from './user.types';

export type AbilityAction = (typeof ABILITY_ACTIONS)[number];

export type AbilitySubject = (typeof ABILITY_SUBJECTS)[number];

export type Abilities = [
  AbilityAction,
  AbilitySubject | ForcedSubject<Exclude<AbilitySubject, 'all'>>,
];

export type AppAbility = MongoAbility<Abilities>;

export type PermissionKeys = (typeof PERMISSION_KEYS)[number];

export interface Permission {
  subject: AbilitySubject;
  action: AbilityAction[];
}

// -------------------------------------------------------------------------
// Requests
// -------------------------------------------------------------------------

export interface CreateRoleReq {
  name: string;
  color: string;
}

export interface UpdateRolePermissionsReq {
  permissions: Permission[];
}

// -------------------------------------------------------------------------
// Responses
// -------------------------------------------------------------------------

export interface RoleRes {
  id: string;
  name: string;
  color: string;
  permissions: Permission[];
  memberCount: number;
  members: UserRes[];
}
