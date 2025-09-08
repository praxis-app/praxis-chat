import { FindOptionsWhere, In } from 'typeorm';
import * as channelsService from '../channels/channels.service';
import { sanitizeText } from '../common/common.utils';
import { dataSource } from '../database/data-source';
import { Image } from '../images/entities/image.entity';
import { deleteImageFile } from '../images/images.utils';
import { ProposalAction } from '../proposal-actions/entities/proposal-action.entity';
import * as proposalActionsService from '../proposal-actions/proposal-actions.service';
import * as pubSubService from '../pub-sub/pub-sub.service';
import { getServerConfig } from '../server-configs/server-configs.service';
import { User } from '../users/user.entity';
import { Vote } from '../votes/vote.entity';
import {
  sortConsensusVotesByType,
  sortMajorityVotesByType,
} from '../votes/votes.utils';
import { ProposalDto } from './dtos/proposal.dto';
import { ProposalConfig } from './entities/proposal-config.entity';
import { Proposal } from './entities/proposal.entity';

const imageRepository = dataSource.getRepository(Image);
const proposalRepository = dataSource.getRepository(Proposal);
const userRepository = dataSource.getRepository(User);
const voteRepository = dataSource.getRepository(Vote);

export const getProposal = (id: string, relations?: string[]) => {
  return proposalRepository.findOneOrFail({
    where: { id },
    relations,
  });
};

export const getProposals = (
  where?: FindOptionsWhere<Proposal>,
  relations?: string[],
) => {
  return proposalRepository.find({ where, relations });
};

export const getChannelProposals = async (
  channelId: string,
  offset?: number,
  limit?: number,
  currentUserId?: string,
) => {
  const proposals = await proposalRepository.find({
    where: { channelId },
    relations: ['user', 'images', 'action'],
    select: {
      id: true,
      body: true,
      stage: true,
      channelId: true,
      user: {
        id: true,
        name: true,
      },
      images: {
        id: true,
        filename: true,
        createdAt: true,
      },
      action: {
        actionType: true,
      },
      createdAt: true,
    },
    order: { createdAt: 'DESC' },
    skip: offset,
    take: limit,
  });

  // Fetch the current user's votes for these proposals in one query
  const proposalIds = proposals.map((p) => p.id);
  const myVotes =
    currentUserId && proposalIds.length
      ? await voteRepository.find({
          where: { proposalId: In(proposalIds), userId: currentUserId },
        })
      : [];
  const proposalIdToMyVote = new Map(myVotes.map((v) => [v.proposalId, v]));

  return proposals.map((proposal) => ({
    id: proposal.id,
    body: proposal.body,
    stage: proposal.stage,
    channelId: proposal.channelId,
    user: proposal.user,
    images: proposal.images.map((image) => ({
      id: image.id,
      isPlaceholder: !image.filename,
      createdAt: image.createdAt,
    })),
    action: proposal.action?.actionType,
    createdAt: proposal.createdAt,
    myVoteId: proposalIdToMyVote.get(proposal.id)?.id,
    myVoteType: proposalIdToMyVote.get(proposal.id)?.voteType,
  }));
};

// TODO: Account for instances with multiple servers / guilds
export const getProposalMembers = async () => {
  return userRepository.find({
    where: {
      anonymous: false,
      locked: false,
    },
  });
};

export const isProposalRatifiable = async (proposalId: string) => {
  const { votes, stage, config } = await getProposal(proposalId, [
    'config',
    'votes',
  ]);
  const members = await getProposalMembers();

  if (stage !== 'voting') {
    return false;
  }
  if (config.decisionMakingModel === 'consensus') {
    return hasConsensus(votes, config, members);
  }
  if (config.decisionMakingModel === 'consent') {
    return hasConsent(votes, config);
  }
  if (config.decisionMakingModel === 'majority-vote') {
    return hasMajorityVote(votes, config, members);
  }
  return false;
};

export const hasConsensus = async (
  votes: Vote[],
  {
    ratificationThreshold,
    reservationsLimit,
    standAsidesLimit,
    closingAt,
  }: ProposalConfig,
  members: User[],
) => {
  if (closingAt && Date.now() < Number(closingAt)) {
    return false;
  }

  const { agreements, reservations, standAsides, blocks } =
    sortConsensusVotesByType(votes);

  return (
    agreements.length >= members.length * (ratificationThreshold * 0.01) &&
    reservations.length <= reservationsLimit &&
    standAsides.length <= standAsidesLimit &&
    blocks.length === 0
  );
};

export const hasConsent = (votes: Vote[], proposalConfig: ProposalConfig) => {
  const { reservations, standAsides, blocks } = sortConsensusVotesByType(votes);
  const { reservationsLimit, standAsidesLimit, closingAt } = proposalConfig;

  return (
    Date.now() >= Number(closingAt) &&
    reservations.length <= reservationsLimit &&
    standAsides.length <= standAsidesLimit &&
    blocks.length === 0
  );
};

export const hasMajorityVote = (
  votes: Vote[],
  { ratificationThreshold, closingAt }: ProposalConfig,
  members: User[],
) => {
  if (closingAt && Date.now() < Number(closingAt)) {
    return false;
  }
  const { agreements } = sortMajorityVotesByType(votes);

  return agreements.length >= members.length * (ratificationThreshold * 0.01);
};

export const createProposal = async (
  { body, closingAt, action, channelId }: ProposalDto,
  userId: string,
) => {
  const sanitizedBody = sanitizeText(body);
  if (body && body.length > 8000) {
    throw new Error('Proposals must be 8000 characters or less');
  }

  const serverConfig = await getServerConfig();
  const configClosingAt = serverConfig.votingTimeLimit
    ? new Date(Date.now() + serverConfig.votingTimeLimit * 60 * 1000)
    : undefined;

  const proposalConfig: Partial<ProposalConfig> = {
    decisionMakingModel: serverConfig.decisionMakingModel,
    ratificationThreshold: serverConfig.ratificationThreshold,
    reservationsLimit: serverConfig.reservationsLimit,
    standAsidesLimit: serverConfig.standAsidesLimit,
    closingAt: closingAt || configClosingAt,
  };

  const proposalAction: Partial<ProposalAction> = {
    actionType: action.actionType,
  };

  const proposal = await proposalRepository.save({
    body: sanitizedBody,
    config: proposalConfig,
    action: proposalAction,
    channelId,
    userId,
  });

  if (action.role) {
    await proposalActionsService.createProposalActionRole(
      proposal.action.id,
      action.role,
    );
  }

  // Shape to match feed expectations
  const shapedProposal = {
    id: proposal.id,
    body: proposal.body,
    stage: proposal.stage,
    channelId: proposal.channelId,
    images: [],
    action: proposal.action?.actionType,
    createdAt: proposal.createdAt,
    user: await userRepository.findOne({
      where: { id: userId },
      select: { id: true, name: true },
    }),
  };

  // Publish proposal to all other channel members for realtime feed updates
  const channelMembers = await channelsService.getChannelMembers(channelId);
  for (const member of channelMembers) {
    if (member.userId === userId) {
      continue;
    }
    await pubSubService.publish(getNewProposalKey(channelId, member.userId), {
      type: 'proposal',
      proposal: shapedProposal,
    });
  }

  return shapedProposal;
};

// TODO: Ensure notifications and pub-sub messages are sent when proposals are ratified
export const ratifyProposal = async (proposalId: string) => {
  await proposalRepository.update(proposalId, {
    stage: 'ratified',
  });
};

export const implementProposal = async (proposalId: string) => {
  const {
    action: { id, actionType },
  } = await getProposal(proposalId, ['action']);

  if (actionType === 'change-role') {
    await proposalActionsService.implementChangeRole(id);
  }
  if (actionType === 'create-role') {
    await proposalActionsService.implementCreateRole(id);
  }
};

export const deleteProposal = async (proposalId: string) => {
  const images = await imageRepository.find({ where: { proposalId } });
  for (const { filename } of images) {
    if (filename) {
      await deleteImageFile(filename);
    }
  }
  return proposalRepository.delete(proposalId);
};

const getNewProposalKey = (channelId: string, userId: string) => {
  return `new-proposal-${channelId}-${userId}`;
};
