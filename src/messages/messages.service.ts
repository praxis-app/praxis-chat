import { PubSubMessageType } from '@common/pub-sub/pub-sub.constants';
import * as channelsService from '../channels/channels.service';
import { sanitizeText } from '../common/common.utils';
import { decryptText, encryptText } from '../common/encryption.utils';
import { dataSource } from '../database/data-source';
import { Image } from '../images/entities/image.entity';
import * as pubSubService from '../pub-sub/pub-sub.service';
import { User } from '../users/user.entity';
import * as usersService from '../users/users.service';
import { Message } from './message.entity';
import { CreateMessageDto } from './message.types';
import { isCommandMessage } from '../commands/commands.service';
import { enqueueCommand } from '../commands/command-queue.service';

const messageRepository = dataSource.getRepository(Message);
const imageRepository = dataSource.getRepository(Image);

// TODO: Return `resolvedName` field for users
export const getMessages = async (
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
      'message.isBot',
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
    .leftJoin('message.images', 'messageImage')
    .where('message.channelId = :channelId', { channelId })
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

      return { ...message, body, images, user };
    },
  );

  return shapedMessages;
};

export const createMessage = async (
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
    ...message,
    body: plaintext,
    images: attachedImages,
    user: {
      id: user.id,
      name: user.name,
      displayName: user.displayName,
      profilePicture,
    },
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

  // Check if the message is a command and enqueue it for processing
  if (plaintext && isCommandMessage(plaintext)) {
    try {
      // Create bot message immediately with 'processing' status
      const botMessage = await createBotMessage(
        channelId,
        'Processing your command...',
        'processing',
      );

      // Enqueue command for background processing
      await enqueueCommand({
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
  commandStatus: 'processing' | 'completed' | 'failed' | null = null,
) => {
  const messageData: Partial<Message> = {
    userId: null,
    isBot: true,
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

  const messagePayload = {
    ...message,
    body: plaintext,
    images: [],
    user: null,
    isBot: true,
    commandStatus,
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
    commandStatus: 'processing' | 'completed' | 'failed';
  },
) => {
  const message = await messageRepository.findOne({
    where: { id: messageId, isBot: true },
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

  const messagePayload = {
    ...updatedMessage,
    body: plaintext,
    images: [],
    user: null,
    isBot: true,
    commandStatus: updates.commandStatus,
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
