import { CommandStatus } from '@common/commands/command.types';
import { PubSubMessageType } from '@common/pub-sub/pub-sub.constants';
import * as dotenv from 'dotenv';
import { IsNull, Not } from 'typeorm';
import { getDefaultBot } from '../bots/bots.service';
import * as channelsService from '../channels/channels.service';
import * as commandsService from '../commands/commands.service';
import { sanitizeText } from '../common/text.utils';
import { decryptText, encryptText } from '../common/encryption.utils';
import { dataSource } from '../database/data-source';
import { Image } from '../images/entities/image.entity';
import * as pubSubService from '../pub-sub/pub-sub.service';
import { User } from '../users/user.entity';
import * as usersService from '../users/users.service';
import { Message } from './message.entity';
import { CreateMessageDto } from './message.types';

dotenv.config();

const messageRepository = dataSource.getRepository(Message);
const imageRepository = dataSource.getRepository(Image);

// TODO: Return `resolvedName` field for users
export const getMessages = async (
  serverId: string,
  channelId: string,
  offset?: number,
  limit?: number,
) => {
  const messages = await messageRepository
    .createQueryBuilder('message')
    .select([
      'message.id',
      'message.ciphertext',
      'message.keyId',
      'message.tag',
      'message.iv',
      'message.botId',
      'message.commandStatus',
      'message.createdAt',
    ])
    .addSelect([
      'messageUser.id',
      'messageUser.name',
      'messageUser.displayName',
    ])
    .addSelect([
      'messageImage.id',
      'messageImage.filename',
      'messageImage.createdAt',
    ])
    .leftJoin('message.user', 'messageUser')
    .leftJoin('message.bot', 'messageBot')
    .addSelect(['messageBot.id', 'messageBot.name', 'messageBot.displayName'])
    .leftJoin('message.images', 'messageImage')
    .innerJoin('message.channel', 'channel')
    .where('channel.serverId = :serverId', { serverId })
    .andWhere('message.channelId = :channelId', { channelId })
    .orderBy('message.createdAt', 'DESC')
    .skip(offset)
    .take(limit)
    .getMany();

  const unwrappedKeyMap = await channelsService.getUnwrappedChannelKeyMap(
    messages
      .filter((message) => message.keyId)
      .map((message) => message.keyId!),
  );

  const userIds = messages
    .filter((message) => message.user)
    .map((message) => message.user!.id);

  const profilePictures = await usersService.getUserProfilePicturesMap(userIds);

  const shapedMessages = messages.map(
    ({ ciphertext, tag, iv, keyId, ...message }) => {
      let body: string | null = null;

      if (ciphertext && tag && iv && keyId) {
        const unwrappedKey = unwrappedKeyMap[keyId];
        body = decryptText(ciphertext, tag, iv, unwrappedKey);
      }

      const images = message.images.map((image) => ({
        id: image.id,
        isPlaceholder: !image.filename,
        createdAt: image.createdAt,
      }));

      const user = message.user
        ? {
            ...message.user,
            profilePicture: profilePictures[message.user.id],
          }
        : null;

      const bot = message.bot
        ? {
            id: message.bot.id,
            name: message.bot.name,
            displayName: message.bot.displayName,
          }
        : null;

      return { ...message, body, images, user, bot };
    },
  );

  return shapedMessages;
};

export const createMessage = async (
  serverId: string,
  channelId: string,
  { body, imageCount }: CreateMessageDto,
  user: User,
) => {
  let messageData: Partial<Message> = {
    userId: user.id,
    channelId,
  };

  const plaintext = sanitizeText(body);
  if (plaintext) {
    const { unwrappedKey, ...channelKey } =
      await channelsService.getUnwrappedChannelKey(channelId);

    const { ciphertext, tag, iv } = encryptText(plaintext, unwrappedKey);

    messageData = {
      ...messageData,
      keyId: channelKey.id,
      ciphertext,
      tag,
      iv,
    };
  }

  const message = await messageRepository.save(messageData);
  const profilePicture = await usersService.getUserProfilePicture(user.id);

  let images: Image[] = [];
  if (imageCount) {
    const imagePlaceholders = Array.from({ length: imageCount }).map(() => {
      return imageRepository.create({
        messageId: message.id,
        imageType: 'message',
      });
    });

    // TODO: Refactor - save message and images in a single transaction
    images = await imageRepository.save(imagePlaceholders);
  }
  const attachedImages = images.map((image) => ({
    id: image.id,
    isPlaceholder: true,
    createdAt: image.createdAt,
  }));

  const messagePayload = {
    id: message.id,
    body: plaintext,
    images: attachedImages,
    user: {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      profilePicture,
    },
    userId: user.id,
    botId: null,
    bot: null,
    commandStatus: message.commandStatus,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };

  const channelMembers = await channelsService.getChannelMembers(channelId);
  for (const member of channelMembers) {
    if (member.userId === user.id) {
      continue;
    }
    await pubSubService.publish(getNewMessageKey(channelId, member.userId), {
      type: PubSubMessageType.MESSAGE,
      message: messagePayload,
    });
  }

  // TODO: Send an error message for invalid command messages

  if (
    plaintext &&
    user.anonymous === false &&
    process.env.ENABLE_LLM_FEATURES === 'true' &&
    commandsService.isCommandMessage(plaintext)
  ) {
    try {
      const botMessage = await createBotMessage(
        channelId,
        'Processing your command...',
        'processing',
      );

      await commandsService.queueCommandJob({
        serverId,
        channelId,
        messageBody: plaintext,
        botMessageId: botMessage.id,
      });
    } catch (error) {
      console.error('Error enqueueing command', error);
    }
  }

  return messagePayload;
};

const createBotMessage = async (
  channelId: string,
  body: string,
  commandStatus: CommandStatus | null = null,
) => {
  const defaultBot = await getDefaultBot();
  const messageData: Partial<Message> = {
    userId: null,
    botId: defaultBot.id,
    channelId,
    commandStatus,
  };

  const plaintext = sanitizeText(body);
  if (plaintext) {
    const { unwrappedKey, ...channelKey } =
      await channelsService.getUnwrappedChannelKey(channelId);

    const { ciphertext, tag, iv } = encryptText(plaintext, unwrappedKey);

    messageData.keyId = channelKey.id;
    messageData.ciphertext = ciphertext;
    messageData.tag = tag;
    messageData.iv = iv;
  }

  const message = await messageRepository.save(messageData);

  const bot = {
    id: defaultBot.id,
    name: defaultBot.name,
    displayName: defaultBot.displayName,
  };

  const messagePayload = {
    id: message.id,
    body: plaintext,
    images: [],
    user: null,
    userId: null,
    botId: bot.id,
    bot,
    commandStatus,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };

  const channelMembers = await channelsService.getChannelMembers(channelId);
  for (const member of channelMembers) {
    await pubSubService.publish(getNewMessageKey(channelId, member.userId), {
      type: PubSubMessageType.MESSAGE,
      message: messagePayload,
    });
  }

  return messagePayload;
};

export const updateBotMessage = async (
  messageId: string,
  updates: {
    body: string;
    commandStatus: CommandStatus;
  },
) => {
  const message = await messageRepository.findOne({
    where: { id: messageId, botId: Not(IsNull()) },
    relations: ['bot'],
  });

  if (!message) {
    throw new Error('Bot message not found');
  }

  const plaintext = sanitizeText(updates.body);
  if (plaintext) {
    const { unwrappedKey, ...channelKey } =
      await channelsService.getUnwrappedChannelKey(message.channelId);

    const { ciphertext, tag, iv } = encryptText(plaintext, unwrappedKey);

    message.ciphertext = ciphertext;
    message.tag = tag;
    message.iv = iv;
    message.keyId = channelKey.id;
  }

  message.commandStatus = updates.commandStatus;

  const updatedMessage = await messageRepository.save(message);

  const bot = message.bot
    ? {
        id: message.bot.id,
        name: message.bot.name,
        displayName: message.bot.displayName,
      }
    : null;

  const messagePayload = {
    id: updatedMessage.id,
    body: plaintext,
    images: [],
    user: null,
    userId: null,
    botId: bot?.id,
    bot,
    commandStatus: updates.commandStatus,
    createdAt: updatedMessage.createdAt,
    updatedAt: updatedMessage.updatedAt,
  };

  const channelMembers = await channelsService.getChannelMembers(
    message.channelId,
  );
  for (const member of channelMembers) {
    await pubSubService.publish(
      getNewMessageKey(message.channelId, member.userId),
      {
        type: PubSubMessageType.MESSAGE,
        message: messagePayload,
      },
    );
  }

  return messagePayload;
};

export const saveMessageImage = async (
  messageId: string,
  imageId: string,
  filename: string,
  user: User,
) => {
  const message = await messageRepository.findOne({
    where: { id: messageId },
  });
  if (!message) {
    throw new Error('Message not found');
  }

  const image = await imageRepository.save({ id: imageId, filename });
  const channelMembers = await channelsService.getChannelMembers(
    message.channelId,
  );
  for (const member of channelMembers) {
    if (member.userId === user.id) {
      continue;
    }
    const channelKey = getNewMessageKey(message.channelId, member.userId);
    await pubSubService.publish(channelKey, {
      type: PubSubMessageType.IMAGE,
      isPlaceholder: false,
      messageId,
      imageId,
    });
  }
  return image;
};

const getNewMessageKey = (channelId: string, userId: string) => {
  return `new-message-${channelId}-${userId}`;
};
