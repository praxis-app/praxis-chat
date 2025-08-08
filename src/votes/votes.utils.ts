import { Vote } from './vote.entity';

interface SortedConsensusVotes {
  agreements: Vote[];
  reservations: Vote[];
  standAsides: Vote[];
  blocks: Vote[];
}

export const sortConsensusVotesByType = (votes: Vote[]) =>
  votes.reduce<SortedConsensusVotes>(
    (result, vote) => {
      if (vote.voteType === 'agree') {
        result.agreements.push(vote);
      }
      if (vote.voteType === 'disagree') {
        result.reservations.push(vote);
      }
      if (vote.voteType === 'abstain') {
        result.standAsides.push(vote);
      }
      if (vote.voteType === 'block') {
        result.blocks.push(vote);
      }
      return result;
    },
    {
      agreements: [],
      reservations: [],
      standAsides: [],
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
