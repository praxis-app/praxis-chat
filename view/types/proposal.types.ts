import {
  DECISION_MAKING_MODEL,
  PROPOSAL_STAGE,
} from '../constants/proposal.constants';
import { Image } from './image.types';
import {
  CreateProposalActionReq,
  ProposalActionReq,
} from './proposal-action.types';
import { VoteType } from './vote.types';

export type DecisionMakingModel = (typeof DECISION_MAKING_MODEL)[number];

export type ProposalStage = (typeof PROPOSAL_STAGE)[number];

export interface Proposal {
  id: string;
  body: string;
  stage: ProposalStage;
  action: ProposalActionReq;
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
