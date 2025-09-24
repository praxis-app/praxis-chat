import * as crypto from 'crypto';
import { sanitizeText } from '../common/common.utils';
import { dataSource } from '../database/data-source';
import * as messagesService from '../messages/messages.service';
import * as proposalsService from '../proposals/proposals.service';
import { ChannelMember } from './entities/channel-member.entity';
import { Channel } from './entities/channel.entity';
import { ChannelKey } from './entities/channel-key.entity';

export interface CreateChannelDto {
  name: string;
  description?: string;
}

export interface UpdateChannelDto {
  name: string;
  description?: string;
}

const GENERAL_CHANNEL_NAME = 'general';

const channelRepository = dataSource.getRepository(Channel);
const channelMemberRepository = dataSource.getRepository(ChannelMember);
const channelKeyRepository = dataSource.getRepository(ChannelKey);

export const getChannel = (channelId: string) => {
  return channelRepository.findOneOrFail({
    where: { id: channelId },
  });
};

export const getChannels = async () => {
  const channelCount = await channelRepository.count();
  if (channelCount === 0) {
    await initializeGeneralChannel();
  }
  return channelRepository.find({
    order: { createdAt: 'ASC' },
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
  const [messages, proposals] = await Promise.all([
    messagesService.getMessages(channelId, offset, limit),
    proposalsService.getInlineProposals(
      channelId,
      offset,
      limit,
      currentUserId,
    ),
  ]);

  const shapedMessages = messages.map((message) => ({
    ...message,
    type: 'message',
  }));

  const shapedProposals = proposals.map((proposal) => ({
    ...proposal,
    type: 'proposal',
  }));

  const feed = [...shapedMessages, ...shapedProposals]
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

export const addMemberToGeneralChannel = async (userId: string) => {
  const generalChannel = await getGeneralChannel();
  await channelMemberRepository.save({
    channelId: generalChannel.id,
    userId,
  });
};

export const addMemberToAllChannels = async (userId: string) => {
  const channels = await getChannels();
  const channelMembers = channels.map((channel) => ({
    channelId: channel.id,
    userId,
  }));
  await channelMemberRepository.save(channelMembers);
};

export const createChannel = async (
  { name, description }: CreateChannelDto,
  currentUserId: string,
) => {
  const sanitizedName = sanitizeText(name);
  const normalizedName = sanitizedName.toLocaleLowerCase();
  const sanitizedDescription = sanitizeText(description);

  // Generate per-channel key
  const { wrappedKey, tag, iv } = generateChannelKey();

  const channel = await channelRepository.save({
    name: normalizedName,
    description: sanitizedDescription,
    members: [{ userId: currentUserId }],
    keys: [{ wrappedKey, tag, iv }],
  });

  return channel;
};

const generateChannelKey = () => {
  // Generate per-channel key
  const channelKey = crypto.randomBytes(32);

  // Wrap it with the master key
  const masterKey = Buffer.from(process.env.CHANNEL_KEY_MASTER!, 'base64');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);

  const wrappedKey = Buffer.concat([cipher.update(channelKey), cipher.final()]);
  const tag = cipher.getAuthTag();

  return { wrappedKey, tag, iv };
};

export const getUnwrappedChannelKey = async (channelId: string) => {
  const channelKey = await channelKeyRepository.findOneOrFail({
    where: { channelId, active: true },
  });

  const masterKey = Buffer.from(process.env.CHANNEL_KEY_MASTER!, 'base64');

  // TODO: Check if `Buffer.from` is necessary here
  const iv = Buffer.from(channelKey.iv);
  const ciphertext = Buffer.from(channelKey.wrappedKey);
  const authTag = Buffer.from(channelKey.tag);

  // TODO: Add constant for algorithm
  const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, iv);
  decipher.setAuthTag(authTag);

  const unwrappedKey = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return unwrappedKey;
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

const initializeGeneralChannel = () => {
  return channelRepository.save({
    name: GENERAL_CHANNEL_NAME,
  });
};
