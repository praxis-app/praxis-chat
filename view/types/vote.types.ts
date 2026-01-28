import { VoteType } from '@common/votes/vote.types';

export interface VoteRes {
  id: string;
  voteType?: VoteType;
  pollOptionIds?: string[];
}

export interface CreateVoteRes {
  id: string;
  pollId: string;
  userId: string;
  voteType?: VoteType;
  pollOptionIds?: string[];
  isRatifyingVote: boolean;
}

export type UpdateVoteRes = {
  isRatifyingVote: boolean;
};

export interface CreateVoteReq {
  voteType?: VoteType;
  pollOptionIds?: string[];
}

export interface UpdateVoteReq {
  voteType?: VoteType;
  pollOptionIds?: string[];
}
