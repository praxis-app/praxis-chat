import {
  DECISION_MAKING_MODEL,
  PROPOSAL_STAGE,
} from '../constants/proposal.constants';
import { ImageRes } from './image.types';
import {
  CreateProposalActionReq,
  ProposalActionRes,
} from './proposal-action.types';
import { VoteType } from './vote.types';

export type DecisionMakingModel = (typeof DECISION_MAKING_MODEL)[number];

export type ProposalStage = (typeof PROPOSAL_STAGE)[number];

export interface ProposalRes {
  id: string;
  body: string;
  stage: ProposalStage;
  action?: ProposalActionRes;
  images: ImageRes[];
  channelId: string;
  user?: { id: string; name: string };
  createdAt: string;
  myVoteId?: string;
  myVoteType?: VoteType;
}

export interface CreateProposalReq {
  body?: string;
  action: CreateProposalActionReq;
  images: ImageRes[];
}
