import { FindOptionsWhere } from 'typeorm';
import { dataSource } from '../database/data-source';
import * as proposalsService from '../proposals/proposals.service';
import { Vote } from './vote.entity';
import { VoteType } from './vote.types';

interface CreateVoteReq {
  proposalId: string;
  voteType: VoteType;
}

const voteRepository = dataSource.getRepository(Vote);

export const getVote = async (id: string, relations?: string[]) => {
  return voteRepository.findOneOrFail({ where: { id }, relations });
};

export const getVotes = async (where?: FindOptionsWhere<Vote>) => {
  return voteRepository.find({ where });
};

export const getVoteCount = async () => {
  return voteRepository.count();
};

export const createVote = async (voteData: CreateVoteReq, userId: string) => {
  const vote = await voteRepository.save({
    ...voteData,
    userId,
  });

  const isProposalRatifiable = await proposalsService.isProposalRatifiable(
    vote.proposalId,
  );
  if (isProposalRatifiable) {
    await proposalsService.ratifyProposal(vote.proposalId);
    await proposalsService.implementProposal(vote.proposalId);
  }

  return vote;
};

export const updateVote = async (voteId: string, voteType: VoteType) => {
  const result = await voteRepository.update(voteId, { voteType });
  const vote = await getVote(voteId, ['proposal']);

  if (vote.proposalId) {
    const isProposalRatifiable = await proposalsService.isProposalRatifiable(
      vote.proposalId,
    );
    if (isProposalRatifiable) {
      await proposalsService.ratifyProposal(vote.proposalId);
      await proposalsService.implementProposal(vote.proposalId);
    }
  }

  return result;
};

export const deleteVote = async (voteId: string) => {
  return voteRepository.delete(voteId);
};
