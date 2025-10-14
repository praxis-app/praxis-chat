import {
  PollActionType,
  RoleAttributeChangeType,
} from '@common/poll-actions/poll-action.types';
import { AbilityAction, AbilitySubject } from '@common/roles/app-ability';
import { UserRes } from './user.types';

// -------------------------------------------------------------------------
// Requests
// -------------------------------------------------------------------------

export interface PollActionReq {
  actionType: PollActionType;
  role?: PollActionRoleReq;
}

export interface PollActionRoleReq {
  name?: string;
  color?: string;
  prevName?: string;
  prevColor?: string;
  members?: PollActionRoleMemberReq[];
  permissions?: PollActionRolePermissionReq[];
}

export interface PollActionRoleMemberReq {
  userId: string;
  changeType: RoleAttributeChangeType;
}

export interface PollActionRolePermissionReq {
  subject: AbilitySubject;
  action: AbilityAction;
  changeType: RoleAttributeChangeType;
}

export interface CreatePollActionReq {
  actionType: PollActionType;
  role?: CreatePollActionRoleReq;
}

export interface CreatePollActionRoleReq {
  name?: string;
  color?: string;
  members?: CreatePollActionRoleMemberReq[];
  permissions?: CreatePollActionRolePermissionReq[];
  roleToUpdateId?: string;
}

export interface CreatePollActionRoleMemberReq {
  userId: string;
  changeType: RoleAttributeChangeType;
}

export interface CreatePollActionRolePermissionReq {
  subject: AbilitySubject;
  actions: { action: AbilityAction; changeType: RoleAttributeChangeType }[];
}

// -------------------------------------------------------------------------
// Responses
// -------------------------------------------------------------------------

export interface PollActionRes {
  id: string;
  actionType: PollActionType;
  role?: PollActionRoleRes;
}

export interface PollActionRoleRes {
  id: string;
  name?: string;
  color?: string;
  prevName?: string;
  prevColor?: string;
  roleId: string;
  members?: PollActionRoleMemberRes[];
  permissions?: PollActionRolePermissionRes[];
}

export interface PollActionRoleMemberRes {
  changeType: RoleAttributeChangeType;
  user: UserRes;
}

export interface PollActionRolePermissionRes {
  subject: AbilitySubject;
  action: AbilityAction;
  changeType: RoleAttributeChangeType;
}
