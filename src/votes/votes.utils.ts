import { sortConsensusVotesByType } from '@common/votes/vote.utils';
import { Vote } from './vote.entity';

export { sortConsensusVotesByType };

export const sortMajorityVotesByType = (votes: Vote[]) =>
  votes.reduce<{ agreements: Vote[]; disagreements: Vote[] }>(
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
