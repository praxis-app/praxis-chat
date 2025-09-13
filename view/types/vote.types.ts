import { VOTE_TYPE } from '@/constants/proposal.constants';

export type VoteType = (typeof VOTE_TYPE)[number];

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
