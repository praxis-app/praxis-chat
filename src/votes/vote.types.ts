import { PROPOSAL_VOTE_TYPE } from '@common/proposals/proposal.constants';

export type VoteType = (typeof PROPOSAL_VOTE_TYPE)[number];
