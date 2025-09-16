import { RoleAttributeChangeType } from '@common/proposal-actions/proposal-action.types';
import { PROPOSAL_ACTION_TYPE } from '@common/proposals/proposal.constants';
import { AbilityAction, AbilitySubject } from './role.types';
import { UserRes } from './user.types';

export type ProposalActionType = (typeof PROPOSAL_ACTION_TYPE)[number];

// -------------------------------------------------------------------------
// Requests
// -------------------------------------------------------------------------

export interface ProposalActionReq {
  actionType: ProposalActionType;
  role?: ProposalActionRoleReq;
}

export interface ProposalActionRoleReq {
  name?: string;
  color?: string;
  prevName?: string;
  prevColor?: string;
  members?: ProposalActionRoleMemberReq[];
  permissions?: ProposalActionRolePermissionReq[];
}

export interface ProposalActionRoleMemberReq {
  userId: string;
  changeType: RoleAttributeChangeType;
}

export interface ProposalActionRolePermissionReq {
  subject: AbilitySubject;
  action: AbilityAction;
  changeType: RoleAttributeChangeType;
}

export interface CreateProposalActionReq {
  actionType: ProposalActionType;
  role?: CreateProposalActionRoleReq;
}

export interface CreateProposalActionRoleReq {
  name?: string;
  color?: string;
  members?: CreateProposalActionRoleMemberReq[];
  permissions?: CreateProposalActionRolePermissionReq[];
  roleToUpdateId?: string;
}

export interface CreateProposalActionRoleMemberReq {
  userId: string;
  changeType: RoleAttributeChangeType;
}

export interface CreateProposalActionRolePermissionReq {
  subject: AbilitySubject;
  actions: { action: AbilityAction; changeType: RoleAttributeChangeType }[];
}

// -------------------------------------------------------------------------
// Responses
// -------------------------------------------------------------------------

export interface ProposalActionRes {
  id: string;
  actionType: ProposalActionType;
  role?: ProposalActionRoleRes;
}

export interface ProposalActionRoleRes {
  id: string;
  name?: string;
  color?: string;
  prevName?: string;
  prevColor?: string;
  roleId: string;
  members?: ProposalActionRoleMemberRes[];
  permissions?: ProposalActionRolePermissionRes[];
}

export interface ProposalActionRoleMemberRes {
  changeType: RoleAttributeChangeType;
  user: UserRes;
}

export interface ProposalActionRolePermissionRes {
  subject: AbilitySubject;
  action: AbilityAction;
  changeType: RoleAttributeChangeType;
}
