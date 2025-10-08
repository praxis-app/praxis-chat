import { In, IsNull, Not } from 'typeorm';
import * as channelsService from '../channels/channels.service';
import { sanitizeText } from '../common/common.utils';
import { dataSource } from '../database/data-source';
import { Image } from '../images/entities/image.entity';
import { deleteImageFile } from '../images/images.utils';
import { ProposalActionRole } from '../proposal-actions/entities/proposal-action-role.entity';
import { ProposalAction } from '../proposal-actions/entities/proposal-action.entity';
import * as proposalActionsService from '../proposal-actions/proposal-actions.service';
import * as pubSubService from '../pub-sub/pub-sub.service';
import { getServerConfig } from '../server-configs/server-configs.service';
import { User } from '../users/user.entity';
import * as usersService from '../users/users.service';
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

export const getInlineProposals = async (
  channelId: string,
  offset?: number,
  limit?: number,
  currentUserId?: string,
) => {
  const { entities: proposals, raw } = await proposalRepository
    .createQueryBuilder('proposal')
    .select([
      'proposal.id',
      'proposal.body',
      'proposal.stage',
      'proposal.channelId',
      'proposal.createdAt',
      'proposalAction.actionType',
    ])
    .addSelect([
      'proposalVotes.id',
      'proposalVotes.voteType',
      'proposalVotes.createdAt',
      'proposalVotes.updatedAt',
    ])
    .addSelect([
      'proposalConfig.decisionMakingModel',
      'proposalConfig.ratificationThreshold',
      'proposalConfig.disagreementsLimit',
      'proposalConfig.abstainsLimit',
      'proposalConfig.closingAt',
    ])
    .addSelect([
      'proposalActionRole.id',
      'proposalActionRole.name',
      'proposalActionRole.color',
      'proposalActionRole.prevName',
      'proposalActionRole.prevColor',
      'proposalActionRole.roleId',
    ])
    .addSelect([
      'proposalActionPermission.subject',
      'proposalActionPermission.action',
      'proposalActionPermission.changeType',
    ])
    .addSelect([
      'proposalActionRoleMember.id',
      'proposalActionRoleMember.changeType',
      'proposalActionRoleMemberUser.id',
      'proposalActionRoleMemberUser.name',
      'proposalActionRoleMemberUser.displayName',
    ])
    .addSelect([
      'proposalUser.id',
      'proposalUser.name',
      'proposalUser.displayName',
    ])
    .addSelect([
      'proposalImage.id',
      'proposalImage.filename',
      'proposalImage.createdAt',
    ])
    .leftJoin('proposal.user', 'proposalUser')
    .leftJoin('proposal.votes', 'proposalVotes')
    .leftJoin('proposal.images', 'proposalImage')
    .leftJoin('proposal.action', 'proposalAction')
    .leftJoin('proposal.config', 'proposalConfig')
    .leftJoin('proposalAction.role', 'proposalActionRole')
    .leftJoin('proposalActionRole.permissions', 'proposalActionPermission')
    .leftJoin('proposalActionRole.members', 'proposalActionRoleMember')
    .leftJoin('proposalActionRoleMember.user', 'proposalActionRoleMemberUser')
    .where('proposal.channelId = :channelId', { channelId })
    .orderBy('proposal.createdAt', 'DESC')
    .skip(offset)
    .take(limit)
    .getRawAndEntities();

  // Fetch the current user's votes
  const proposalIds = proposals.map((p) => p.id);
  const myVotesMap = currentUserId
    ? await getMyVotesMap(proposalIds, currentUserId)
    : {};

  // Get users eligible to vote on this proposal
  const proposalMemberCount = await getProposalMemberCount();

  const userImagesMap = await usersService.getUserImagesMap(
    proposals.map((p) => p.user.id),
  );

  const shapedProposals = proposals.map((proposal) => {
    const votesNeededToRatify = Math.ceil(
      proposalMemberCount * (proposal.config.ratificationThreshold * 0.01),
    );

    const agreementVoteCount = proposal.votes.filter(
      (vote) => vote.voteType === 'agree',
    ).length;

    const myVote = myVotesMap[proposal.id]
      ? {
          id: myVotesMap[proposal.id].id,
          voteType: myVotesMap[proposal.id].voteType,
        }
      : undefined;

    const rowsForProposal = raw.filter((r) => {
      return r.proposal_id === proposal.id;
    });

    const actionRole = proposal.action.role
      ? {
          ...proposal.action.role,
          permissions: rowsForProposal.map((r) => ({
            changeType: r.proposalActionPermission_changeType,
            subject: r.proposalActionPermission_subject,
            action: r.proposalActionPermission_action,
          })),
        }
      : undefined;

    const profilePicture = userImagesMap[proposal.user.id]?.profilePicture;

    return {
      ...proposal,
      action: {
        ...proposal.action,
        role: actionRole,
      },
      images: proposal.images.map((image) => ({
        id: image.id,
        isPlaceholder: !image.filename,
        createdAt: image.createdAt,
      })),
      user: {
        ...proposal.user,
        profilePicture,
      },
      votesNeededToRatify,
      agreementVoteCount,
      myVote,
    };
  });

  return shapedProposals;
};

export const isProposalRatifiable = async (proposalId: string) => {
  const { votes, stage, config } = await getProposal(proposalId, [
    'config',
    'votes',
  ]);
  if (stage !== 'voting') {
    return false;
  }

  const memberCount = await getProposalMemberCount();

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

export const createProposal = async (
  channelId: string,
  { body, closingAt, action }: ProposalDto,
  user: User,
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
    disagreementsLimit: serverConfig.disagreementsLimit,
    abstainsLimit: serverConfig.abstainsLimit,
    closingAt: closingAt || configClosingAt,
  };

  const proposalAction: Partial<ProposalAction> = {
    actionType: action.actionType,
  };

  const proposal = await proposalRepository.save({
    body: sanitizedBody,
    config: proposalConfig,
    action: proposalAction,
    userId: user.id,
    channelId,
  });

  const proposalMemberCount = await getProposalMemberCount();
  const votesNeededToRatify = Math.ceil(
    proposalMemberCount * (serverConfig.ratificationThreshold * 0.01),
  );

  let proposalActionRole: ProposalActionRole | undefined;
  if (action.role) {
    proposalActionRole = await proposalActionsService.createProposalActionRole(
      proposal.action.id,
      action.role,
    );
  }

  const profilePicture = await usersService.getUserProfilePicture(user.id);
  const coverPhoto = await usersService.getUserCoverPhoto(user.id);

  // Shape to match feed expectations
  const shapedProposal = {
    id: proposal.id,
    body: proposal.body,
    stage: proposal.stage,
    channelId: proposal.channelId,
    action: {
      actionType: proposal.action?.actionType,
      role: proposalActionRole,
    },
    user: {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      profilePicture,
      coverPhoto,
    },
    // TODO: Handle images
    images: [],
    createdAt: proposal.createdAt,
    agreementVoteCount: 0,
    votesNeededToRatify,
  };

  // Publish proposal to all other channel members for realtime feed updates
  const channelMembers = await channelsService.getChannelMembers(channelId);
  for (const member of channelMembers) {
    if (member.userId === user.id) {
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

export const synchronizeProposals = async () => {
  const proposals = await proposalRepository.find({
    where: {
      config: { closingAt: Not(IsNull()) },
      stage: 'voting',
    },
    select: { id: true },
  });

  for (const proposal of proposals) {
    await synchronizeProposal(proposal);
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
  }: ProposalConfig,
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

const hasConsent = (votes: Vote[], proposalConfig: ProposalConfig) => {
  const { disagreements, abstains, blocks } = sortConsensusVotesByType(votes);
  const { disagreementsLimit, abstainsLimit, closingAt } = proposalConfig;

  return (
    Date.now() >= Number(closingAt) &&
    disagreements.length <= disagreementsLimit &&
    abstains.length <= abstainsLimit &&
    blocks.length === 0
  );
};

const hasMajorityVote = (
  votes: Vote[],
  { ratificationThreshold, closingAt }: ProposalConfig,
  memberCount: number,
) => {
  if (closingAt && Date.now() < Number(closingAt)) {
    return false;
  }
  const { agreements } = sortMajorityVotesByType(votes);

  return agreements.length >= memberCount * (ratificationThreshold * 0.01);
};

/** Synchronizes proposals with regard to voting duration and ratifiability */
const synchronizeProposal = async (proposal: Proposal) => {
  if (
    !proposal.config.closingAt ||
    Date.now() < Number(proposal.config.closingAt)
  ) {
    return;
  }

  const isRatifiable = await isProposalRatifiable(proposal.id);
  if (!isRatifiable) {
    await proposalRepository.update(proposal.id, { stage: 'closed' });
  }

  await ratifyProposal(proposal.id);
  await implementProposal(proposal.id);
};

const getMyVotesMap = async (proposalIds: string[], currentUserId: string) => {
  const myVotes = await voteRepository.find({
    where: { proposalId: In(proposalIds), userId: currentUserId },
  });
  return myVotes.reduce<Record<string, Vote>>((result, vote) => {
    result[vote.proposalId!] = vote;
    return result;
  }, {});
};

// TODO: Account for instances with multiple servers / guilds
const getProposalMemberCount = async () => {
  return userRepository.count({
    where: {
      anonymous: false,
      locked: false,
    },
  });
};

const getNewProposalKey = (channelId: string, userId: string) => {
  return `new-proposal-${channelId}-${userId}`;
};
