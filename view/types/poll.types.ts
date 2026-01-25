import { ImageRes } from '@/types/image.types';
import { CreatePollActionReq, PollActionRes } from '@/types/poll-action.types';
import { UserRes } from '@/types/user.types';
import { VoteRes } from '@/types/vote.types';
import {
  DecisionMakingModel,
  PollStage,
  PollType,
} from '@common/polls/poll.types';

export interface PollRes {
  id: string;
  body: string;
  pollType: PollType;
  stage: PollStage;
  action?: PollActionRes;
  config: PollConfigRes;
  options?: PollOptionRes[];
  images: ImageRes[];
  user: UserRes;
  votes: VoteRes[];
  myVote?: VoteRes;
  agreementVoteCount: number;
  memberCount: number;
  createdAt: string;
}

export interface PollOptionRes {
  id: string;
  text: string;
  voteCount: number;
}

export interface PollConfigRes {
  decisionMakingModel?: DecisionMakingModel;
  agreementThreshold?: number;
  quorumEnabled?: boolean;
  quorumThreshold?: number;
  disagreementsLimit?: number;
  abstainsLimit?: number;
  closingAt?: string;
  multipleChoice?: boolean;
}

export interface CreatePollReq {
  body?: string;
  pollType?: PollType;
  action?: CreatePollActionReq;
  options?: string[];
  multipleChoice?: boolean;
  closingAt?: string;
}
