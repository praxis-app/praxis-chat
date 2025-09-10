import {
  DECISION_MAKING_MODEL,
  PROPOSAL_ACTION_TYPE,
  PROPOSAL_STAGE,
} from '../constants/proposal.constants';
import { Image } from './image.types';
import {
  AbilityAction,
  AbilitySubject,
  RoleAttributeChangeType,
} from './role.types';
import { VoteType } from './vote.types';

export type DecisionMakingModel = (typeof DECISION_MAKING_MODEL)[number];

export type ProposalActionType = (typeof PROPOSAL_ACTION_TYPE)[number];

export type ProposalStage = (typeof PROPOSAL_STAGE)[number];

export interface Proposal {
  id: string;
  body: string;
  stage: ProposalStage;
  action: ProposalActionType;
  images: Image[];
  channelId: string;
  user?: { id: string; name: string };
  createdAt: string;
  myVoteId?: string;
  myVoteType?: VoteType;
}

export interface CreateProposalReq {
  body?: string;
  action: CreateProposalActionReq;
  images: Image[];
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
