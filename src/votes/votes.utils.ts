import { Vote } from './vote.entity';

interface SortedConsensusVotes {
  agreements: Vote[];
  disagreements: Vote[];
  abstains: Vote[];
  blocks: Vote[];
}

export const sortConsensusVotesByType = (votes: Vote[]) =>
  votes.reduce<SortedConsensusVotes>(
    (result, vote) => {
      if (vote.voteType === 'agree') {
        result.agreements.push(vote);
      }
      if (vote.voteType === 'disagree') {
        result.disagreements.push(vote);
      }
      if (vote.voteType === 'abstain') {
        result.abstains.push(vote);
      }
      if (vote.voteType === 'block') {
        result.blocks.push(vote);
      }
      return result;
    },
    {
      agreements: [],
      disagreements: [],
      abstains: [],
      blocks: [],
    },
  );

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
