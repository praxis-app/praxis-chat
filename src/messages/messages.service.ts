import * as crypto from 'crypto';
import * as channelsService from '../channels/channels.service';
import { sanitizeText } from '../common/common.utils';
import { dataSource } from '../database/data-source';
import { Image } from '../images/entities/image.entity';
import * as pubSubService from '../pub-sub/pub-sub.service';
import { User } from '../users/user.entity';
import { Message } from './message.entity';

enum MessageType {
  MESSAGE = 'message',
  IMAGE = 'image',
}

export interface CreateMessageDto {
  body?: string;
  imageCount: number;
}

const messageRepository = dataSource.getRepository(Message);
const imageRepository = dataSource.getRepository(Image);

export const getMessages = async (
  channelId: string,
  offset?: number,
  limit?: number,
) => {
  const messages = await messageRepository.find({
    where: { channelId },
    relations: ['user', 'images'],
    select: {
      id: true,
      body: true,
      user: {
        id: true,
        name: true,
      },
      images: {
        id: true,
        filename: true,
        createdAt: true,
      },
      createdAt: true,
    },
    order: {
      createdAt: 'DESC',
    },
    skip: offset,
    take: limit,
  });

  return messages.map((message) => ({
    ...message,
    images: message.images.map((image) => {
      return {
        id: image.id,
        isPlaceholder: !image.filename,
        createdAt: image.createdAt,
      };
    }),
  }));
};

export const createMessage = async (
  channelId: string,
  { body, imageCount }: CreateMessageDto,
  user: User,
) => {
  const channelKey = await channelsService.getUnwrappedChannelKey(channelId);
  const { ciphertext, tag, iv } = encryptMessage(
    sanitizeText(body),
    channelKey,
  );

  const message = await messageRepository.save({
    userId: user.id,
    channelId,
    ciphertext,
    tag,
    iv,
  });
  let images: Image[] = [];

  if (imageCount) {
    const imagePlaceholders = Array.from({ length: imageCount }).map(() => {
      return imageRepository.create({ messageId: message.id });
    });
    images = await imageRepository.save(imagePlaceholders);
  }
  const shapedImages = images.map((image) => ({
    id: image.id,
    isPlaceholder: true,
    createdAt: image.createdAt,
  }));
  const messagePayload = {
    ...message,
    images: shapedImages,
    user: { id: user.id, name: user.name },
  };

  const channelMembers = await channelsService.getChannelMembers(channelId);
  for (const member of channelMembers) {
    if (member.userId === user.id) {
      continue;
    }
    await pubSubService.publish(getNewMessageKey(channelId, member.userId), {
      type: MessageType.MESSAGE,
      message: messagePayload,
    });
  }

  return messagePayload;
};

const encryptMessage = (message: string, channelKey: Buffer) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', channelKey, iv);

  const ciphertext = Buffer.concat([cipher.update(message), cipher.final()]);
  const tag = cipher.getAuthTag();

  return { ciphertext, tag, iv };
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
      type: MessageType.IMAGE,
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
