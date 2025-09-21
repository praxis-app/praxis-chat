import {
  DecisionMakingModel,
  ProposalStage,
} from '@common/proposals/proposal.types';
import { VoteType } from '@common/votes/vote.types';
import { ImageRes } from './image.types';
import {
  CreateProposalActionReq,
  ProposalActionRes,
} from './proposal-action.types';

export interface ProposalRes {
  id: string;
  body: string;
  stage: ProposalStage;
  action?: ProposalActionRes;
  config?: ProposalConfigRes;
  images: ImageRes[];
  channelId: string;
  user?: { id: string; name: string };
  createdAt: string;
  myVote?: { id: string; voteType: VoteType };
  votesNeededToRatify: number;
  agreementVoteCount: number;
}

export interface ProposalConfigRes {
  decisionMakingModel: DecisionMakingModel;
  ratificationThreshold: number;
  disagreementsLimit: number;
  abstainsLimit: number;
  closingAt?: string;
}

export interface CreateProposalReq {
  body?: string;
  action: CreateProposalActionReq;
}
