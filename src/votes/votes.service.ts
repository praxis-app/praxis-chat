import { VoteType } from '@common/votes/vote.types';
import { FindOptionsWhere } from 'typeorm';
import { dataSource } from '../database/data-source';
import * as pollActionsService from '../poll-actions/poll-actions.service';
import { PollOptionSelection } from '../polls/entities/poll-option-selection.entity';
import { Poll } from '../polls/entities/poll.entity';
import * as pollsService from '../polls/polls.service';
import * as usersService from '../users/users.service';
import { Vote } from './vote.entity';

interface VoteDto {
  voteType?: VoteType;
  pollOptionIds?: string[];
}

const pollRepository = dataSource.getRepository(Poll);
const voteRepository = dataSource.getRepository(Vote);

const pollOptionSelectionRepository =
  dataSource.getRepository(PollOptionSelection);

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
  { voteType, pollOptionIds }: VoteDto,
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
  if (isProposal && !voteType) {
    throw new Error('Vote type is required for proposals');
  }
  if (!isProposal && !pollOptionIds) {
    throw new Error('Poll option IDs are required for simple polls');
  }

  // Check if user has already voted on this poll
  const existingVote = await voteRepository.findOne({
    where: { pollId, userId },
  });
  if (existingVote) {
    throw new Error('User has already voted on this poll');
  }

  const vote = await voteRepository.save({
    pollOptionSelections: pollOptionIds?.map((pollOptionId) => ({
      pollOptionId,
    })),
    voteType,
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

  return {
    ...vote,
    pollOptionIds,
    isRatifyingVote: isPollRatifiable,
  };
};

export const updateVote = async (
  voteId: string,
  { voteType, pollOptionIds }: VoteDto,
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
    if (!pollOptionIds) {
      throw new Error('Poll option is required for polls');
    }
    await voteRepository.update(voteId, {
      pollOptionSelections: pollOptionIds?.map((pollOptionId) => ({
        pollOptionId,
      })),
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

export const getVotersByPollOption = async (pollOptionId: string) => {
  const selections = await pollOptionSelectionRepository.find({
    where: { pollOptionId },
    relations: ['vote', 'vote.user'],
  });

  const userIds = selections.map((selection) => selection.vote.user.id);
  const profilePicturesMap =
    await usersService.getUserProfilePicturesMap(userIds);

  const voters = selections.map((selection) => {
    const { id, name, displayName } = selection.vote.user;
    const profilePicture = profilePicturesMap[id] ?? null;

    return {
      id,
      name,
      displayName,
      profilePicture: profilePicture ? { id: profilePicture.id } : null,
    };
  });

  return { voters };
};
