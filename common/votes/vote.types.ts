import { VOTE_TYPES } from './vote.constants';

export type VoteType = (typeof VOTE_TYPES)[number];
