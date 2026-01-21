// TODO: Set up logging with winston or a similar tool

import { getRequiredCount } from '@common/polls/poll.utils';
import { PubSubMessageType } from '@common/pub-sub/pub-sub.constants';
import { sortConsensusVotesByType } from '@common/votes/vote.utils';
import { DeepPartial, In, IsNull, Not } from 'typeorm';
import * as channelsService from '../channels/channels.service';
import { ChannelMember } from '../channels/entities/channel-member.entity';
import { decryptText, encryptText } from '../common/encryption.utils';
import { sanitizeText } from '../common/text.utils';
import { dataSource } from '../database/data-source';
import { Image } from '../images/entities/image.entity';
import { deleteImageFile } from '../images/images.utils';
import * as instanceService from '../instance/instance.service';
import { PollActionRole } from '../poll-actions/entities/poll-action-role.entity';
import { PollAction } from '../poll-actions/entities/poll-action.entity';
import * as pollActionsService from '../poll-actions/poll-actions.service';
import * as pubSubService from '../pub-sub/pub-sub.service';
import * as serverConfigsService from '../servers/server-configs/server-configs.service';
import { User } from '../users/user.entity';
import * as usersService from '../users/users.service';
import { Vote } from '../votes/vote.entity';
import {
  filterProposalVotes,
  sortMajorityVotesByType,
} from '../votes/votes.utils';
import { PollDto } from './dtos/poll.dto';
import { PollConfig } from './entities/poll-config.entity';
import { Poll } from './entities/poll.entity';

const POLL_SYNC_BATCH_SIZE = 20;

const channelMemberRepository = dataSource.getRepository(ChannelMember);
const imageRepository = dataSource.getRepository(Image);
const pollRepository = dataSource.getRepository(Poll);
const voteRepository = dataSource.getRepository(Vote);

export const getPoll = (id: string, relations?: string[]) => {
  return pollRepository.findOneOrFail({
    where: { id },
    relations,
  });
};

export const getInlinePolls = async (
  serverId: string,
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
      'pollConfig.decisionMakingModel',
      'pollConfig.agreementThreshold',
      'pollConfig.quorumEnabled',
      'pollConfig.quorumThreshold',
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
      'pollActionRole.serverRoleId',
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
    .addSelect(['pollVotes.id', 'pollVotes.voteType'])
    .addSelect(['pollUser.id', 'pollUser.name', 'pollUser.displayName'])
    .addSelect(['pollImage.id', 'pollImage.filename', 'pollImage.createdAt'])
    .leftJoin('poll.user', 'pollUser')
    .leftJoin('poll.votes', 'pollVotes')
    .leftJoin('poll.images', 'pollImage')
    .leftJoin('poll.action', 'pollAction')
    .leftJoin('poll.config', 'pollConfig')
    .leftJoin('pollAction.serverRole', 'pollActionRole')
    .leftJoin('pollActionRole.permissions', 'pollActionPermission')
    .leftJoin('pollActionRole.members', 'pollActionRoleMember')
    .leftJoin('pollActionRoleMember.user', 'pollActionRoleMemberUser')
    .innerJoin('poll.channel', 'channel')
    .where('channel.serverId = :serverId', { serverId })
    .andWhere('channel.id = :channelId', { channelId })
    .orderBy('poll.createdAt', 'DESC')
    .skip(offset)
    .take(limit)
    .getRawAndEntities();

  // Get the current user's vote for each poll
  const pollIds = polls.map((p) => p.id);
  const myVotesMap = currentUserId
    ? await getMyVotesMap(pollIds, currentUserId)
    : {};

  // Get users eligible to vote on polls (used for quorum calculation)
  const pollMemberCountMap = await getPollMemberCountMap(pollIds);

  // Get unwrapped channel keys for polls
  const unwrappedKeyMap = await channelsService.getUnwrappedChannelKeyMap(
    polls.filter((poll) => poll.keyId).map((poll) => poll.keyId!),
  );

  // Get profile pictures for poll authors
  const profilePicturesMap = await usersService.getUserProfilePicturesMap(
    polls.map((p) => p.user.id),
  );

  const shapedPolls = polls.map((poll) => {
    const { ciphertext, tag, iv, keyId } = poll;

    let body: string | null = null;
    if (ciphertext && tag && iv && keyId) {
      const unwrappedKey = unwrappedKeyMap[keyId];
      body = decryptText(ciphertext, tag, iv, unwrappedKey);
    }

    const agreementVoteCount = poll.votes.filter(
      (vote) => vote.voteType === 'agree',
    ).length;

    const myVote = myVotesMap[poll.id]
      ? {
          id: myVotesMap[poll.id].id,
          voteType: myVotesMap[poll.id].voteType,
        }
      : undefined;

    const memberCount = pollMemberCountMap[poll.id];
    const profilePicture = profilePicturesMap[poll.user.id];

    const rowsForPoll = raw.filter((r) => {
      return r.poll_id === poll.id;
    });

    const actionRole = poll.action.serverRole
      ? {
          ...poll.action.serverRole,
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
        serverRole: actionRole,
      },
      images: poll.images.map((image) => ({
        id: image.id,
        isPlaceholder: !image.filename,
        createdAt: image.createdAt,
      })),
      user: {
        ...poll.user,
        profilePicture,
      },
      votes: poll.votes,
      config: poll.config,
      createdAt: poll.createdAt,
      agreementVoteCount,
      memberCount,
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

  const memberCount = await getPollMemberCount(pollId);

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

export const isPublicChannelPoll = async (
  serverId: string,
  channelId: string,
  pollId: string,
) => {
  const exists = await pollRepository.exists({
    where: { id: pollId, channel: { serverId, id: channelId } },
  });
  if (!exists) {
    throw new Error('Poll not found');
  }

  const { defaultServerId } = await instanceService.getInstanceConfigSafely();

  return defaultServerId === serverId;
};

export const createPoll = async (
  serverId: string,
  channelId: string,
  { body, closingAt, action, imageCount }: PollDto,
  user: User,
) => {
  const sanitizedBody = sanitizeText(body);
  if (body && body.length > 8000) {
    throw new Error('Polls must be 8000 characters or less');
  }

  const serverConfig = await serverConfigsService.getServerConfig(serverId);
  const configClosingAt = serverConfig.votingTimeLimit
    ? new Date(Date.now() + serverConfig.votingTimeLimit * 60 * 1000)
    : undefined;

  const pollConfig: Partial<PollConfig> = {
    decisionMakingModel: serverConfig.decisionMakingModel,
    agreementThreshold: serverConfig.agreementThreshold,
    quorumEnabled: serverConfig.quorumEnabled,
    quorumThreshold: serverConfig.quorumThreshold,
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

  const pollMemberCount = await getPollMemberCount(poll.id);

  let pollActionRole: PollActionRole | undefined;
  if (action.serverRole) {
    pollActionRole = await pollActionsService.createPollActionRole(
      poll.action.id,
      action.serverRole,
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
      serverRole: pollActionRole,
    },
    config: pollConfig,
    user: {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      profilePicture,
    },
    images: attachedImages,
    votes: [],
    agreementVoteCount: 0,
    memberCount: pollMemberCount,
    createdAt: poll.createdAt,
  };

  // Publish poll to all other channel members for realtime feed updates
  const channelMembers = await channelsService.getChannelMembers(channelId);
  for (const member of channelMembers) {
    if (member.userId === user.id) {
      continue;
    }
    await pubSubService.publish(
      getNewPollKey(serverId, channelId, member.userId),
      {
        type: PubSubMessageType.POLL,
        poll: shapedPoll,
      },
    );
  }

  return shapedPoll;
};

export const savePollImage = async (
  serverId: string,
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
    const channelKey = getNewPollKey(serverId, poll.channelId, member.userId);
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

/** Synchronizes polls with regard to voting duration and ratifiability */
export const synchronizePolls = async () => {
  const polls = await pollRepository.find({
    where: {
      config: { closingAt: Not(IsNull()) },
      stage: 'voting',
    },
    select: { id: true, config: { id: true, closingAt: true } },
    relations: ['config'],
  });
  if (polls.length === 0) {
    return;
  }

  // Synchronize polls in batches
  for (let i = 0; i < polls.length; i += POLL_SYNC_BATCH_SIZE) {
    const batch = polls.slice(i, i + POLL_SYNC_BATCH_SIZE);
    const results = await Promise.allSettled(batch.map(synchronizePoll));
    const failures = results.filter((r) => r.status === 'rejected');

    if (failures.length > 0) {
      console.error(
        `Failed to synchronize ${failures.length} polls:`,
        failures,
      );
      continue;
    }

    console.info(`Synchronized ${batch.length} polls 🗳️`);
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

const hasConsensus = (
  votes: Vote[],
  {
    quorumEnabled,
    quorumThreshold,
    agreementThreshold,
    disagreementsLimit,
    abstainsLimit,
    closingAt,
  }: PollConfig,
  memberCount: number,
) => {
  if (closingAt && Date.now() < Number(closingAt)) {
    return false;
  }

  // Quorum check (if enabled)
  if (quorumEnabled) {
    const quorum = votes.length;
    const requiredQuorum = getRequiredCount(memberCount, quorumThreshold);
    if (quorum < requiredQuorum) {
      return false;
    }
  }

  // Agreement check (always performed)
  const { agreements, disagreements, abstains, blocks } =
    sortConsensusVotesByType(filterProposalVotes(votes));

  const yesVotes = agreements.length;
  const noVotes = disagreements.length;
  const participants = yesVotes + noVotes;

  if (participants === 0) {
    return false;
  }

  const isRatifiable =
    yesVotes >= getRequiredCount(participants, agreementThreshold) &&
    disagreements.length <= disagreementsLimit &&
    abstains.length <= abstainsLimit &&
    blocks.length === 0;

  return isRatifiable;
};

// TODO: Fully implement this majority vote logic
const hasMajorityVote = (
  votes: Vote[],
  { agreementThreshold, quorumEnabled, quorumThreshold, closingAt }: PollConfig,
  memberCount: number,
) => {
  if (closingAt && Date.now() < Number(closingAt)) {
    return false;
  }

  // Quorum check (if enabled)
  if (quorumEnabled) {
    const quorum = votes.length;
    const requiredQuorum = getRequiredCount(memberCount, quorumThreshold);
    if (quorum < requiredQuorum) {
      return false;
    }
  }

  // Threshold check (always performed)
  const proposalVotes = filterProposalVotes(votes);
  const { agreements, disagreements } = sortMajorityVotesByType(proposalVotes);
  const yesVotes = agreements.length;
  const noVotes = disagreements.length;
  const participants = yesVotes + noVotes;

  if (participants === 0) {
    return false;
  }

  const requiredAgreements = getRequiredCount(participants, agreementThreshold);
  const isRatifiable = yesVotes >= requiredAgreements;

  return isRatifiable;
};

const hasConsent = (votes: Vote[], pollConfig: PollConfig) => {
  const { disagreements, abstains, blocks } = sortConsensusVotesByType(
    filterProposalVotes(votes),
  );
  const { disagreementsLimit, abstainsLimit, closingAt } = pollConfig;

  return (
    Date.now() >= Number(closingAt) &&
    disagreements.length <= disagreementsLimit &&
    abstains.length <= abstainsLimit &&
    blocks.length === 0
  );
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

const getPollMemberCount = async (pollId: string) => {
  return channelMemberRepository
    .createQueryBuilder('channelMember')
    .innerJoin('channelMember.channel', 'channel')
    .innerJoin('channel.polls', 'poll', 'poll.id = :pollId', { pollId })
    .getCount();
};

const getPollMemberCountMap = async (pollIds: string[]) => {
  if (pollIds.length === 0) {
    return {};
  }

  const results = await channelMemberRepository
    .createQueryBuilder('channelMember')
    .select('poll.id', 'pollId')
    .addSelect('COUNT(channelMember.id)', 'count')
    .innerJoin('channelMember.channel', 'channel')
    .innerJoin('channel.polls', 'poll', 'poll.id IN (:...pollIds)', {
      pollIds,
    })
    .groupBy('poll.id')
    .getRawMany();

  const map: Record<string, number> = {};
  for (const result of results) {
    map[result.pollId] = parseInt(result.count, 10);
  }

  // Ensure all pollIds have an entry (default to 0 if not found)
  for (const pollId of pollIds) {
    if (!(pollId in map)) {
      map[pollId] = 0;
    }
  }

  return map;
};

const getNewPollKey = (serverId: string, channelId: string, userId: string) => {
  return `new-poll-${serverId}-${channelId}-${userId}`;
};
