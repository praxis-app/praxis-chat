import { VoteType } from '@common/votes/vote.types';
import { UpdateResult } from 'typeorm';

export interface VoteRes {
  id: string;
  voteType: VoteType;
}

export interface CreateVoteRes {
  id: string;
  pollId: string;
  userId: string;
  voteType: VoteType;
  isRatifyingVote: boolean;
}

export type UpdateVoteRes = UpdateResult & {
  isRatifyingVote: boolean;
};

export interface CreateVoteReq {
  voteType: VoteType;
}

export interface UpdateVoteReq {
  voteType: VoteType;
}
