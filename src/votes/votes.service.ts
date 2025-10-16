import { VoteType } from '@common/votes/vote.types';
import { FindOptionsWhere } from 'typeorm';
import { dataSource } from '../database/data-source';
import * as pollActionsService from '../poll-actions/poll-actions.service';
import * as pollsService from '../polls/polls.service';
import { Vote } from './vote.entity';

interface CreateVoteDto {
  pollId: string;
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

export const createVote = async (voteData: CreateVoteDto, userId: string) => {
  const vote = await voteRepository.save({
    ...voteData,
    userId,
  });

  const isPollRatifiable = await pollsService.isPollRatifiable(vote.pollId);
  if (isPollRatifiable) {
    // Update poll to reflect newly created vote
    await pollsService.ratifyPoll(vote.pollId);
    await pollActionsService.implementPollAction(vote.pollId);
  }

  return { ...vote, isRatifyingVote: isPollRatifiable };
};

export const updateVote = async (voteId: string, voteType: VoteType) => {
  const result = await voteRepository.update(voteId, { voteType });
  const vote = await getVote(voteId, ['poll']);

  let isPollRatifiable = false;
  if (vote.pollId) {
    isPollRatifiable = await pollsService.isPollRatifiable(vote.pollId);
    if (isPollRatifiable) {
      // Update poll to reflect change in vote
      await pollsService.ratifyPoll(vote.pollId);
      await pollActionsService.implementPollAction(vote.pollId);
    }
  }

  return { ...result, isRatifyingVote: isPollRatifiable };
};

export const deleteVote = async (voteId: string) => {
  return voteRepository.delete(voteId);
};
