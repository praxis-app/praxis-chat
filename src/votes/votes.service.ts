import { VoteType } from '@common/votes/vote.types';
import { FindOptionsWhere } from 'typeorm';
import { dataSource } from '../database/data-source';
import * as pollActionsService from '../poll-actions/poll-actions.service';
import { Poll } from '../polls/entities/poll.entity';
import * as pollsService from '../polls/polls.service';
import { Vote } from './vote.entity';

interface VoteDto {
  voteType?: VoteType;
  pollOptionId?: string;
}

const pollRepository = dataSource.getRepository(Poll);
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

// TODO: Move validation to middleware

export const createVote = async (
  pollId: string,
  userId: string,
  { voteType, pollOptionId }: VoteDto,
) => {
  const poll = await pollRepository.findOne({
    where: { id: pollId },
  });
  if (!poll) {
    throw new Error(`Poll not found with ID: ${pollId}`);
  }

  // Validate vote data based on poll type
  const isProposal = poll.pollType === 'proposal';
  if (isProposal) {
    if (!voteType) {
      throw new Error('Vote type is required for proposals');
    }
  } else {
    if (!pollOptionId) {
      throw new Error('Poll option is required for regular polls');
    }
  }

  const vote = await voteRepository.save({
    pollOptionId: pollOptionId || null,
    voteType: voteType || null,
    pollId,
    userId,
  });

  // Only check ratification for proposals
  let isPollRatifiable = false;
  if (isProposal) {
    isPollRatifiable = await pollsService.isPollRatifiable(vote.pollId!);
    if (isPollRatifiable) {
      await pollsService.ratifyPoll(vote.pollId);
      await pollActionsService.implementPollAction(vote.pollId!);
    }
  }

  return { ...vote, isRatifyingVote: isPollRatifiable };
};

export const updateVote = async (
  voteId: string,
  { voteType, pollOptionId }: VoteDto,
) => {
  const vote = await getVote(voteId, ['poll']);
  const isProposal = vote.poll?.pollType === 'proposal';

  // Update based on poll type
  if (isProposal) {
    if (!voteType) {
      throw new Error('Vote type is required for proposals');
    }
    await voteRepository.update(voteId, { voteType });
  } else {
    if (!pollOptionId) {
      throw new Error('Poll option is required for regular polls');
    }
    await voteRepository.update(voteId, {
      pollOptionId,
    });
  }

  // Only check ratification for proposals
  let isPollRatifiable = false;
  if (vote.pollId && isProposal) {
    isPollRatifiable = await pollsService.isPollRatifiable(vote.pollId);
    if (isPollRatifiable) {
      await pollsService.ratifyPoll(vote.pollId);
      await pollActionsService.implementPollAction(vote.pollId);
    }
  }

  return { isRatifyingVote: isPollRatifiable };
};

export const deleteVote = async (voteId: string) => {
  return voteRepository.delete(voteId);
};
