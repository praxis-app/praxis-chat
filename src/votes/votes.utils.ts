import { WithVoteType } from '@common/votes/vote.utils';
import { Vote } from './vote.entity';

/** Vote with a guaranteed voteType (used for proposals) */
export type ProposalVote = Vote & WithVoteType;

/** Filters votes to only include those with a voteType (proposal votes) */
export const filterProposalVotes = (votes: Vote[]): ProposalVote[] =>
  votes.filter((vote): vote is ProposalVote => vote.voteType !== null);

export const sortMajorityVotesByType = (votes: ProposalVote[]) =>
  votes.reduce<{ agreements: ProposalVote[]; disagreements: ProposalVote[] }>(
    (result, vote) => {
      if (vote.voteType === 'agree') {
        result.agreements.push(vote);
      }
      if (vote.voteType === 'disagree') {
        result.disagreements.push(vote);
      }
      return result;
    },
    { agreements: [], disagreements: [] },
  );
