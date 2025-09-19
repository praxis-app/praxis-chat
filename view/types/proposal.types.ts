import { ProposalStage } from '@common/proposals/proposal.types';
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
  images: ImageRes[];
  channelId: string;
  user?: { id: string; name: string };
  createdAt: string;
  myVote?: { id: string; voteType: VoteType };
  votesNeededToRatify: number;
  agreementVoteCount: number;
}

export interface CreateProposalReq {
  body?: string;
  action: CreateProposalActionReq;

  // FIXME: Incorrect type for requests
  images: ImageRes[];
}
