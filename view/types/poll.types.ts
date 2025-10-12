import { DecisionMakingModel, PollStage } from '@common/polls/poll.types';
import { VoteType } from '@common/votes/vote.types';
import { ImageRes } from './image.types';
import { CreatePollActionReq, PollActionRes } from './poll-action.types';
import { UserRes } from './user.types';

export interface PollRes {
  id: string;
  body: string;
  stage: PollStage;
  action: PollActionRes;
  config: PollConfigRes;
  images: ImageRes[];
  user: UserRes;
  createdAt: string;
  myVote?: { id: string; voteType: VoteType };
  votesNeededToRatify: number;
  agreementVoteCount: number;
}

export interface PollConfigRes {
  decisionMakingModel: DecisionMakingModel;
  ratificationThreshold: number;
  disagreementsLimit: number;
  abstainsLimit: number;
  closingAt?: string;
}

export interface CreatePollReq {
  body?: string;
  action: CreatePollActionReq;
}
