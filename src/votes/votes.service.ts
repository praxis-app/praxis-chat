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
    relations: ['config'],
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
    // Check if user already voted on this proposal
    // PostgreSQL treats NULLs as distinct in unique constraints,
    // so we need to check manually for proposals (where pollOptionId is null)
    const existingVote = await voteRepository.findOne({
      where: { pollId, userId },
    });
    if (existingVote) {
      throw new Error('User has already voted on this proposal');
    }
  } else {
    if (!pollOptionId) {
      throw new Error('Poll option is required for polls');
    }
    // For single choice polls, check if user has already voted
    if (!poll.config.multipleChoice) {
      const existingVote = await voteRepository.findOne({
        where: { pollId, userId },
      });
      if (existingVote) {
        throw new Error('User has already voted on this poll');
      }
    }
    // For multiple choice polls, check if user already voted for this specific option
    if (poll.config.multipleChoice) {
      const existingVote = await voteRepository.findOne({
        where: { pollId, userId, pollOptionId },
      });
      if (existingVote) {
        throw new Error('User has already selected this option');
      }
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
      throw new Error('Poll option is required for polls');
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
