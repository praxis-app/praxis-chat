import {
  DECISION_MAKING_MODEL,
  PROPOSAL_ACTION_TYPE,
  PROPOSAL_STAGE,
  VOTE_TYPE,
} from '../constants/proposal.constants';
import { Image } from './image.types';

export type DecisionMakingModel = (typeof DECISION_MAKING_MODEL)[number];

export type ProposalActionType = (typeof PROPOSAL_ACTION_TYPE)[number];

export type ProposalStage = (typeof PROPOSAL_STAGE)[number];

export type VoteType = (typeof VOTE_TYPE)[number];

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

export interface Vote {
  id: string;
  proposalId: string;
  userId: string;
  voteType: VoteType;
}

export interface CreateProposalReq {
  body: string;
  action: ProposalActionType;
  images: Image[];
}

export interface CreateVoteReq {
  voteType: VoteType;
}

export interface UpdateVoteReq {
  voteType: VoteType;
}
