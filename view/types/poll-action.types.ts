import {
  PollActionType,
  RoleAttributeChangeType,
} from '@common/poll-actions/poll-action.types';
import { AppAbilityAction } from '@common/roles/role.types';
import { ServerAbilitySubject } from '@common/roles/server-roles/server-ability';
import { UserRes } from './user.types';

// -------------------------------------------------------------------------
// Requests
// -------------------------------------------------------------------------

export interface PollActionReq {
  actionType: PollActionType;
  serverRole?: PollActionServerRoleReq;
}

export interface PollActionServerRoleReq {
  name?: string;
  color?: string;
  prevName?: string;
  prevColor?: string;
  members?: PollActionServerRoleMemberReq[];
  permissions?: PollActionServerRolePermissionReq[];
}

export interface PollActionServerRoleMemberReq {
  userId: string;
  changeType: RoleAttributeChangeType;
}

export interface PollActionServerRolePermissionReq {
  subject: ServerAbilitySubject;
  action: AppAbilityAction;
  changeType: RoleAttributeChangeType;
}

export interface CreatePollActionReq {
  actionType: PollActionType;
  serverRole?: CreatePollActionServerRoleReq;
}

export interface CreatePollActionServerRoleReq {
  name?: string;
  color?: string;
  members?: CreatePollActionServerRoleMemberReq[];
  permissions?: CreatePollActionServerRolePermissionReq[];
  serverRoleToUpdateId?: string;
}

export interface CreatePollActionServerRoleMemberReq {
  userId: string;
  changeType: RoleAttributeChangeType;
}

export interface CreatePollActionServerRolePermissionReq {
  subject: ServerAbilitySubject;
  actions: {
    action: AppAbilityAction;
    changeType: RoleAttributeChangeType;
  }[];
}

// -------------------------------------------------------------------------
// Responses
// -------------------------------------------------------------------------

export interface PollActionRes {
  id: string;
  actionType: PollActionType;
  serverRole?: PollActionServerRoleRes;
}

export interface PollActionServerRoleRes {
  id: string;
  name?: string;
  color?: string;
  prevName?: string;
  prevColor?: string;
  serverRoleId: string;
  members?: PollActionServerRoleMemberRes[];
  permissions?: PollActionServerRolePermissionRes[];
}

export interface PollActionServerRoleMemberRes {
  changeType: RoleAttributeChangeType;
  user: UserRes;
}

export interface PollActionServerRolePermissionRes {
  subject: ServerAbilitySubject;
  action: AppAbilityAction;
  changeType: RoleAttributeChangeType;
}
