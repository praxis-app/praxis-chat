import { ImageRes } from '@/types/image.types';
import { CreatePollActionReq, PollActionRes } from '@/types/poll-action.types';
import { UserRes } from '@/types/user.types';
import { VoteRes } from '@/types/vote.types';
import { DecisionMakingModel, PollStage } from '@common/polls/poll.types';

export interface PollRes {
  id: string;
  body: string;
  stage: PollStage;
  action: PollActionRes;
  config: PollConfigRes;
  images: ImageRes[];
  user: UserRes;
  votes: VoteRes[];
  myVote?: VoteRes;
  agreementVoteCount: number;
  memberCount: number;
  createdAt: string;
}

export interface PollConfigRes {
  decisionMakingModel: DecisionMakingModel;
  ratificationThreshold: number;
  quorumEnabled: boolean;
  quorumThreshold: number;
  disagreementsLimit: number;
  abstainsLimit: number;
  closingAt?: string;
}

export interface CreatePollReq {
  body?: string;
  action: CreatePollActionReq;
}
