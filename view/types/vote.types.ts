import { PROPOSAL_VOTE_TYPE } from '@common/proposals/proposal.constants';

export type VoteType = (typeof PROPOSAL_VOTE_TYPE)[number];

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
