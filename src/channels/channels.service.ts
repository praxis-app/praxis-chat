// TODO: Add ability for users to search, leave, and join channels

import { GENERAL_CHANNEL_NAME } from '@common/channels/channel.constants';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import { FindManyOptions, In, QueryFailedError } from 'typeorm';
import {
  AES_256_GCM_ALGORITHM,
  AES_256_GCM_IV_LENGTH,
} from '../common/common.constants';
import { sanitizeText } from '../common/text.utils';
import { dataSource } from '../database/data-source';
import * as messagesService from '../messages/messages.service';
import * as pollsService from '../polls/polls.service';
import { ServerMember } from '../servers/entities/server-member.entity';
import { getInitialServerSafely } from '../servers/servers.service';
import { User } from '../users/user.entity';
import { ChannelKey } from './entities/channel-key.entity';
import { ChannelMember } from './entities/channel-member.entity';
import { Channel } from './entities/channel.entity';

dotenv.config();

export interface CreateChannelDto {
  name: string;
  description?: string;
}

export interface UpdateChannelDto {
  name: string;
  description?: string;
}

const userRepository = dataSource.getRepository(User);
const channelRepository = dataSource.getRepository(Channel);
const channelMemberRepository = dataSource.getRepository(ChannelMember);
const channelKeyRepository = dataSource.getRepository(ChannelKey);
const serverMemberRepository = dataSource.getRepository(ServerMember);

export const getChannel = (serverId: string, channelId: string) => {
  return channelRepository.findOneOrFail({
    where: { id: channelId, serverId },
  });
};

export const getChannelsSafely = async (options?: FindManyOptions<Channel>) => {
  const channelCount = await channelRepository.count();
  if (channelCount === 0) {
    await initializeGeneralChannel();
  }
  return channelRepository.find({
    order: { createdAt: 'ASC', ...options?.order },
    ...options,
  });
};

export const getJoinedChannels = async (userId: string) => {
  return getChannelsSafely({
    where: {
      members: { userId },
    },
  });
};

export const getChannelMembers = (channelId: string) => {
  return channelMemberRepository.find({
    where: { channelId },
  });
};

export const getGeneralChannel = async () => {
  const generalChannel = await channelRepository.findOne({
    where: { name: GENERAL_CHANNEL_NAME },
  });
  if (!generalChannel) {
    return initializeGeneralChannel();
  }
  return generalChannel;
};

export const getChannelFeed = async (
  channelId: string,
  offset?: number,
  limit?: number,
  currentUserId?: string,
) => {
  const [messages, polls] = await Promise.all([
    messagesService.getMessages(channelId, offset, limit),
    pollsService.getInlinePolls(channelId, offset, limit, currentUserId),
  ]);

  const shapedMessages = messages.map((message) => ({
    ...message,
    type: 'message',
  }));

  const shapedPolls = polls.map((poll) => ({
    ...poll,
    type: 'poll',
  }));

  const feed = [...shapedMessages, ...shapedPolls]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit ?? Number.MAX_SAFE_INTEGER);

  return feed;
};

export const getGeneralChannelFeed = async (
  offset?: number,
  limit?: number,
  currentUserId?: string,
) => {
  const channel = await getGeneralChannel();
  return getChannelFeed(channel.id, offset, limit, currentUserId);
};

export const isChannelMember = async (channelId: string, userId: string) => {
  return channelMemberRepository.exist({
    where: { channelId, userId },
  });
};

/** Returns a map of unwrapped channel keys that are keyed by channel key ID */
export const getUnwrappedChannelKeyMap = async (channelKeyIds: string[]) => {
  const channelKeys = await channelKeyRepository.find({
    where: { id: In(channelKeyIds) },
    select: ['id', 'wrappedKey', 'tag', 'iv'],
  });

  return channelKeys.reduce<Record<string, Buffer>>((result, channelKey) => {
    result[channelKey.id] = unwrapChannelKey(channelKey);
    return result;
  }, {});
};

export const getUnwrappedChannelKey = async (channelId: string) => {
  const channelKey = await channelKeyRepository.findOneOrFail({
    where: { channelId },
    order: { createdAt: 'DESC' },
  });
  const unwrappedKey = unwrapChannelKey(channelKey);
  return { ...channelKey, unwrappedKey };
};

export const addMemberToGeneralChannel = async (userId: string) => {
  const generalChannel = await getGeneralChannel();
  await channelMemberRepository.save({
    channelId: generalChannel.id,
    userId,
  });
};

// TODO: Reconsider how new users are added to channels
export const addMemberToAllServerChannels = async (
  userId: string,
  serverId: string,
) => {
  const channelCount = await channelRepository.count();
  if (channelCount === 0) {
    await initializeGeneralChannel();
  }

  const channels = await channelRepository
    .createQueryBuilder('channel')
    .leftJoin('channel.members', 'member', 'member.userId = :userId', {
      userId,
    })
    .where('channel.serverId = :serverId', { serverId })
    .andWhere('member.id IS NULL')
    .getMany();

  if (channels.length === 0) {
    return;
  }

  const channelMembers = channels.map((channel) => ({
    channelId: channel.id,
    userId,
  }));
  await channelMemberRepository.save(channelMembers);
};

export const createChannel = async ({
  name,
  description,
}: CreateChannelDto) => {
  const sanitizedName = sanitizeText(name);
  const normalizedName = sanitizedName.toLocaleLowerCase();
  const sanitizedDescription = sanitizeText(description);

  // Generate per-channel key
  const { wrappedKey, tag, iv } = generateChannelKey();

  const server = await getInitialServerSafely();
  const serverMembers = await serverMemberRepository.find({
    where: { serverId: server.id },
  });

  const channel = await channelRepository.save({
    name: normalizedName,
    description: sanitizedDescription,
    members: serverMembers.map((member) => ({ userId: member.userId })),
    keys: [{ wrappedKey, tag, iv }],
    server,
  });

  return channel;
};

export const generateChannelKey = () => {
  // Generate per-channel key
  const channelKey = crypto.randomBytes(32);

  // Wrap it with the master key
  const masterKey = getChannelKeyMaster();
  const iv = crypto.randomBytes(AES_256_GCM_IV_LENGTH);
  const cipher = crypto.createCipheriv(AES_256_GCM_ALGORITHM, masterKey, iv);

  const wrappedKey = Buffer.concat([cipher.update(channelKey), cipher.final()]);
  const tag = cipher.getAuthTag();

  return { wrappedKey, tag, iv };
};

export const updateChannel = async (
  channelId: string,
  { name, description }: UpdateChannelDto,
) => {
  const sanitizedName = sanitizeText(name);
  const normalizedName = sanitizedName.toLocaleLowerCase();
  const sanitizedDescription = sanitizeText(description);

  return channelRepository.update(channelId, {
    name: normalizedName,
    description: sanitizedDescription,
  });
};

export const deleteChannel = async (channelId: string) => {
  return channelRepository.delete(channelId);
};

// -------------------------------------------------------------------------
// Helper functions
// -------------------------------------------------------------------------

const unwrapChannelKey = ({ wrappedKey, tag, iv }: ChannelKey) => {
  const masterKey = getChannelKeyMaster();
  const decipher = crypto.createDecipheriv(
    AES_256_GCM_ALGORITHM,
    masterKey,
    iv,
  );
  decipher.setAuthTag(tag);

  const unwrappedKey = Buffer.concat([
    decipher.update(wrappedKey),
    decipher.final(),
  ]);

  return unwrappedKey;
};

const getChannelKeyMaster = () => {
  const channelKeyMaster = process.env.CHANNEL_KEY_MASTER;
  if (!channelKeyMaster) {
    throw new Error('CHANNEL_KEY_MASTER is not set');
  }
  return Buffer.from(channelKeyMaster, 'base64');
};

const initializeGeneralChannel = async () => {
  const server = await getInitialServerSafely();

  // Generate per-channel key
  const { wrappedKey, tag, iv } = generateChannelKey();

  const users = await userRepository.find();
  const channelMembers: Partial<ChannelMember>[] = users.map((user) => ({
    userId: user.id,
  }));

  try {
    const channel = await channelRepository.save({
      name: GENERAL_CHANNEL_NAME,
      keys: [{ wrappedKey, tag, iv }],
      members: channelMembers,
      server,
    });

    return channel;
  } catch (error) {
    // Handle race condition: if another request created the channel concurrently,
    // the duplicate key error will be thrown. In this case, fetch and return
    // the channel that was just created by the other request
    if (
      error instanceof QueryFailedError &&
      error.driverError?.message.includes('duplicate key')
    ) {
      const existingChannel = await channelRepository.findOne({
        where: { name: GENERAL_CHANNEL_NAME },
      });
      if (existingChannel) {
        return existingChannel;
      }
    }
    throw error;
  }
};
