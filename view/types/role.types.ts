import { ForcedSubject, MongoAbility } from '@casl/ability';
import { PERMISSION_KEYS } from '../constants/role.constants';
import { User } from './user.types';

export type AbilityAction = 'delete' | 'create' | 'read' | 'update' | 'manage';

export type AbilitySubject =
  | 'ServerConfig'
  | 'Channel'
  | 'Invite'
  | 'Message'
  | 'Role'
  | 'all';

export type Abilities = [
  AbilityAction,
  AbilitySubject | ForcedSubject<Exclude<AbilitySubject, 'all'>>,
];

export type AppAbility = MongoAbility<Abilities>;

export interface Role {
  id: string;
  name: string;
  color: string;
  permissions: Permission[];
  memberCount: number;
  members: User[];
}

export interface Permission {
  subject: AbilitySubject;
  action: AbilityAction[];
}

export interface CreateRoleReq {
  name: string;
  color: string;
}

export interface UpdateRolePermissionsReq {
  permissions: Permission[];
}

export type PermissionKeys = (typeof PERMISSION_KEYS)[number];
