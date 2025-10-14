import { PubSubMessageType } from '@common/pub-sub/pub-sub.constants';
import { DeepPartial, In, IsNull, Not } from 'typeorm';
import * as channelsService from '../channels/channels.service';
import { sanitizeText } from '../common/common.utils';
import { decryptText, encryptText } from '../common/encryption.utils';
import { dataSource } from '../database/data-source';
import { Image } from '../images/entities/image.entity';
import { deleteImageFile } from '../images/images.utils';
import { PollActionRole } from '../poll-actions/entities/poll-action-role.entity';
import { PollAction } from '../poll-actions/entities/poll-action.entity';
import * as pollActionsService from '../poll-actions/poll-actions.service';
import * as pubSubService from '../pub-sub/pub-sub.service';
import { getServerConfig } from '../server-configs/server-configs.service';
import { User } from '../users/user.entity';
import * as usersService from '../users/users.service';
import { Vote } from '../votes/vote.entity';
import {
  sortConsensusVotesByType,
  sortMajorityVotesByType,
} from '../votes/votes.utils';
import { PollDto } from './dtos/poll.dto';
import { PollConfig } from './entities/poll-config.entity';
import { Poll } from './entities/poll.entity';

const imageRepository = dataSource.getRepository(Image);
const pollRepository = dataSource.getRepository(Poll);
const userRepository = dataSource.getRepository(User);
const voteRepository = dataSource.getRepository(Vote);

export const getPoll = (id: string, relations?: string[]) => {
  return pollRepository.findOneOrFail({
    where: { id },
    relations,
  });
};

export const getInlinePolls = async (
  channelId: string,
  offset?: number,
  limit?: number,
  currentUserId?: string,
) => {
  const { entities: polls, raw } = await pollRepository
    .createQueryBuilder('poll')
    .select([
      'poll.id',
      'poll.ciphertext',
      'poll.keyId',
      'poll.tag',
      'poll.iv',
      'poll.stage',
      'poll.channelId',
      'poll.createdAt',
      'pollAction.actionType',
    ])
    .addSelect([
      'pollVotes.id',
      'pollVotes.voteType',
      'pollVotes.createdAt',
      'pollVotes.updatedAt',
    ])
    .addSelect([
      'pollConfig.decisionMakingModel',
      'pollConfig.ratificationThreshold',
      'pollConfig.disagreementsLimit',
      'pollConfig.abstainsLimit',
      'pollConfig.closingAt',
    ])
    .addSelect([
      'pollActionRole.id',
      'pollActionRole.name',
      'pollActionRole.color',
      'pollActionRole.prevName',
      'pollActionRole.prevColor',
      'pollActionRole.roleId',
    ])
    .addSelect([
      'pollActionPermission.subject',
      'pollActionPermission.action',
      'pollActionPermission.changeType',
    ])
    .addSelect([
      'pollActionRoleMember.id',
      'pollActionRoleMember.changeType',
      'pollActionRoleMemberUser.id',
      'pollActionRoleMemberUser.name',
      'pollActionRoleMemberUser.displayName',
    ])
    .addSelect(['pollUser.id', 'pollUser.name', 'pollUser.displayName'])
    .addSelect(['pollImage.id', 'pollImage.filename', 'pollImage.createdAt'])
    .leftJoin('poll.user', 'pollUser')
    .leftJoin('poll.votes', 'pollVotes')
    .leftJoin('poll.images', 'pollImage')
    .leftJoin('poll.action', 'pollAction')
    .leftJoin('poll.config', 'pollConfig')
    .leftJoin('pollAction.role', 'pollActionRole')
    .leftJoin('pollActionRole.permissions', 'pollActionPermission')
    .leftJoin('pollActionRole.members', 'pollActionRoleMember')
    .leftJoin('pollActionRoleMember.user', 'pollActionRoleMemberUser')
    .where('poll.channelId = :channelId', { channelId })
    .orderBy('poll.createdAt', 'DESC')
    .skip(offset)
    .take(limit)
    .getRawAndEntities();

  // Fetch the current user's votes
  const pollIds = polls.map((p) => p.id);
  const myVotesMap = currentUserId
    ? await getMyVotesMap(pollIds, currentUserId)
    : {};

  // Get users eligible to vote on this poll
  const pollMemberCount = await getPollMemberCount();

  const unwrappedKeyMap = await channelsService.getUnwrappedChannelKeyMap(
    polls.filter((poll) => poll.keyId).map((poll) => poll.keyId!),
  );

  const profilePictures = await usersService.getUserProfilePicturesMap(
    polls.map((p) => p.user.id),
  );

  const shapedPolls = polls.map((poll) => {
    const { ciphertext, tag, iv, keyId } = poll;

    let body: string | null = null;
    if (ciphertext && tag && iv && keyId) {
      const unwrappedKey = unwrappedKeyMap[keyId];
      body = decryptText(ciphertext, tag, iv, unwrappedKey);
    }
    const votesNeededToRatify = Math.ceil(
      pollMemberCount * (poll.config.ratificationThreshold * 0.01),
    );

    const agreementVoteCount = poll.votes.filter(
      (vote) => vote.voteType === 'agree',
    ).length;

    const myVote = myVotesMap[poll.id]
      ? {
          id: myVotesMap[poll.id].id,
          voteType: myVotesMap[poll.id].voteType,
        }
      : undefined;

    const rowsForPoll = raw.filter((r) => {
      return r.poll_id === poll.id;
    });

    const actionRole = poll.action.role
      ? {
          ...poll.action.role,
          permissions: rowsForPoll.map((r) => ({
            changeType: r.pollActionPermission_changeType,
            subject: r.pollActionPermission_subject,
            action: r.pollActionPermission_action,
          })),
        }
      : undefined;

    return {
      id: poll.id,
      stage: poll.stage,
      action: {
        ...poll.action,
        role: actionRole,
      },
      images: poll.images.map((image) => ({
        id: image.id,
        isPlaceholder: !image.filename,
        createdAt: image.createdAt,
      })),
      user: {
        ...poll.user,
        profilePicture: profilePictures[poll.user.id],
      },
      votes: poll.votes,
      config: poll.config,
      createdAt: poll.createdAt,
      votesNeededToRatify,
      agreementVoteCount,
      myVote,
      body,
    };
  });

  return shapedPolls;
};

export const isPollRatifiable = async (pollId: string) => {
  const { votes, stage, config } = await getPoll(pollId, ['config', 'votes']);
  if (stage !== 'voting') {
    return false;
  }

  const memberCount = await getPollMemberCount();

  if (config.decisionMakingModel === 'consensus') {
    return hasConsensus(votes, config, memberCount);
  }
  if (config.decisionMakingModel === 'consent') {
    return hasConsent(votes, config);
  }
  if (config.decisionMakingModel === 'majority-vote') {
    return hasMajorityVote(votes, config, memberCount);
  }
  return false;
};

export const createPoll = async (
  channelId: string,
  { body, closingAt, action, imageCount }: PollDto,
  user: User,
) => {
  const sanitizedBody = sanitizeText(body);
  if (body && body.length > 8000) {
    throw new Error('Polls must be 8000 characters or less');
  }

  const serverConfig = await getServerConfig();
  const configClosingAt = serverConfig.votingTimeLimit
    ? new Date(Date.now() + serverConfig.votingTimeLimit * 60 * 1000)
    : undefined;

  const pollConfig: Partial<PollConfig> = {
    decisionMakingModel: serverConfig.decisionMakingModel,
    ratificationThreshold: serverConfig.ratificationThreshold,
    disagreementsLimit: serverConfig.disagreementsLimit,
    abstainsLimit: serverConfig.abstainsLimit,
    closingAt: closingAt || configClosingAt,
  };

  const pollAction: Partial<PollAction> = {
    actionType: action.actionType,
  };

  let pollData: DeepPartial<Poll> = {
    config: pollConfig,
    action: pollAction,
    userId: user.id,
    channelId,
  };

  if (sanitizedBody) {
    const { unwrappedKey, ...channelKey } =
      await channelsService.getUnwrappedChannelKey(channelId);

    const { ciphertext, tag, iv } = encryptText(sanitizedBody, unwrappedKey);

    pollData = {
      ...pollData,
      keyId: channelKey.id,
      ciphertext,
      tag,
      iv,
    };
  }

  const poll = await pollRepository.save(pollData);

  const pollMemberCount = await getPollMemberCount();
  const votesNeededToRatify = Math.ceil(
    pollMemberCount * (serverConfig.ratificationThreshold * 0.01),
  );

  let pollActionRole: PollActionRole | undefined;
  if (action.role) {
    pollActionRole = await pollActionsService.createPollActionRole(
      poll.action.id,
      action.role,
    );
  }

  const profilePicture = await usersService.getUserProfilePicture(user.id);

  let images: Image[] = [];
  if (imageCount) {
    const imagePlaceholders = Array.from({ length: imageCount }).map(() => {
      return imageRepository.create({
        pollId: poll.id,
        imageType: 'poll',
      });
    });
    images = await imageRepository.save(imagePlaceholders);
  }
  const attachedImages = images.map((image) => ({
    id: image.id,
    isPlaceholder: true,
    createdAt: image.createdAt,
  }));

  // Shape to match feed expectations
  const shapedPoll = {
    id: poll.id,
    body: sanitizedBody,
    stage: poll.stage,
    channelId: poll.channelId,
    action: {
      actionType: poll.action?.actionType,
      role: pollActionRole,
    },
    user: {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      profilePicture,
    },
    images: attachedImages,
    createdAt: poll.createdAt,
    agreementVoteCount: 0,
    votesNeededToRatify,
  };

  // Publish poll to all other channel members for realtime feed updates
  const channelMembers = await channelsService.getChannelMembers(channelId);
  for (const member of channelMembers) {
    if (member.userId === user.id) {
      continue;
    }
    await pubSubService.publish(getNewPollKey(channelId, member.userId), {
      type: 'poll',
      poll: shapedPoll,
    });
  }

  return shapedPoll;
};

export const savePollImage = async (
  pollId: string,
  imageId: string,
  filename: string,
  user: User,
) => {
  const poll = await pollRepository.findOne({
    where: { id: pollId },
  });
  if (!poll) {
    throw new Error('Poll not found');
  }

  const image = await imageRepository.save({ id: imageId, filename });
  const channelMembers = await channelsService.getChannelMembers(
    poll.channelId,
  );
  for (const member of channelMembers) {
    if (member.userId === user.id) {
      continue;
    }
    const channelKey = getNewPollKey(poll.channelId, member.userId);
    await pubSubService.publish(channelKey, {
      type: PubSubMessageType.IMAGE,
      isPlaceholder: false,
      pollId,
      imageId,
    });
  }
  return image;
};

// TODO: Ensure notifications and pub-sub messages are sent when polls are ratified
export const ratifyPoll = async (pollId: string) => {
  await pollRepository.update(pollId, {
    stage: 'ratified',
  });
};

export const synchronizePolls = async () => {
  const polls = await pollRepository.find({
    where: {
      config: { closingAt: Not(IsNull()) },
      stage: 'voting',
    },
    select: { id: true },
  });

  for (const poll of polls) {
    await synchronizePoll(poll);
  }
};

export const deletePoll = async (pollId: string) => {
  const images = await imageRepository.find({ where: { pollId } });
  for (const { filename } of images) {
    if (filename) {
      await deleteImageFile(filename);
    }
  }
  return pollRepository.delete(pollId);
};

// -------------------------------------------------------------------------
// Helper functions
// -------------------------------------------------------------------------

const hasConsensus = async (
  votes: Vote[],
  {
    ratificationThreshold,
    disagreementsLimit,
    abstainsLimit,
    closingAt,
  }: PollConfig,
  memberCount: number,
) => {
  if (closingAt && Date.now() < Number(closingAt)) {
    return false;
  }

  const agreementsNeeded = memberCount * (ratificationThreshold * 0.01);
  const { agreements, disagreements, abstains, blocks } =
    sortConsensusVotesByType(votes);

  const isRatifiable =
    agreements.length >= agreementsNeeded &&
    disagreements.length <= disagreementsLimit &&
    abstains.length <= abstainsLimit &&
    blocks.length === 0;

  return isRatifiable;
};

const hasConsent = (votes: Vote[], pollConfig: PollConfig) => {
  const { disagreements, abstains, blocks } = sortConsensusVotesByType(votes);
  const { disagreementsLimit, abstainsLimit, closingAt } = pollConfig;

  return (
    Date.now() >= Number(closingAt) &&
    disagreements.length <= disagreementsLimit &&
    abstains.length <= abstainsLimit &&
    blocks.length === 0
  );
};

const hasMajorityVote = (
  votes: Vote[],
  { ratificationThreshold, closingAt }: PollConfig,
  memberCount: number,
) => {
  if (closingAt && Date.now() < Number(closingAt)) {
    return false;
  }
  const { agreements } = sortMajorityVotesByType(votes);

  return agreements.length >= memberCount * (ratificationThreshold * 0.01);
};

/** Synchronizes polls with regard to voting duration and ratifiability */
const synchronizePoll = async (poll: Poll) => {
  if (!poll.config.closingAt || Date.now() < Number(poll.config.closingAt)) {
    return;
  }

  const isRatifiable = await isPollRatifiable(poll.id);
  if (!isRatifiable) {
    await pollRepository.update(poll.id, { stage: 'closed' });
    return;
  }

  await ratifyPoll(poll.id);
  await pollActionsService.implementPollAction(poll.id);
};

const getMyVotesMap = async (pollIds: string[], currentUserId: string) => {
  const myVotes = await voteRepository.find({
    where: { pollId: In(pollIds), userId: currentUserId },
  });
  return myVotes.reduce<Record<string, Vote>>((result, vote) => {
    result[vote.pollId!] = vote;
    return result;
  }, {});
};

// TODO: Account for instances with multiple servers / guilds
const getPollMemberCount = async () => {
  return userRepository.count({
    where: {
      anonymous: false,
      locked: false,
    },
  });
};

const getNewPollKey = (channelId: string, userId: string) => {
  return `new-poll-${channelId}-${userId}`;
};
