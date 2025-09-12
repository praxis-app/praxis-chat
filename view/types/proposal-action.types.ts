import { PROPOSAL_ACTION_TYPE } from '@/constants/proposal.constants';
import {
  AbilityAction,
  AbilitySubject,
  RoleAttributeChangeType,
} from './role.types';

export type ProposalActionType = (typeof PROPOSAL_ACTION_TYPE)[number];

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
