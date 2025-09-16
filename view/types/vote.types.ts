import { VoteType } from '@common/votes/vote.types';

export interface VoteRes {
  id: string;
  proposalId: string;
  userId: string;
  voteType: VoteType;
}

export interface CreateVoteReq {
  voteType: VoteType;
}

export interface UpdateVoteReq {
  voteType: VoteType;
}
