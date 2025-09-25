import * as crypto from 'crypto';
import * as channelsService from '../channels/channels.service';
import {
  AES_256_GCM_ALGORITHM,
  AES_256_GCM_IV_LENGTH,
} from '../common/common.constants';
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
  // TODO: Ensure relations are loaded correctly
  const messages = await messageRepository.find({
    where: { channelId },
    relations: ['user', 'images'],
    select: {
      id: true,
      ciphertext: true,
      keyId: true,
      tag: true,
      iv: true,
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

  const unwrappedKeyMap = await channelsService.getUnwrappedChannelKeyMap(
    messages
      .filter((message) => message.keyId)
      .map((message) => message.keyId!),
  );

  const decryptedMessages = messages.map((message) => {
    let body: string | null = null;

    if (message.ciphertext && message.tag && message.iv && message.keyId) {
      const unwrappedKey = unwrappedKeyMap[message.keyId];

      body = decryptMessage(
        message.ciphertext,
        message.tag,
        message.iv,
        unwrappedKey,
      );
    }
    return {
      ...message,
      images: message.images.map((image) => {
        ({
          id: image.id,
          isPlaceholder: !image.filename,
          createdAt: image.createdAt,
        });
      }),
      body,
    };
  });

  return decryptedMessages;
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

    const { ciphertext, tag, iv } = encryptMessage(plaintext, unwrappedKey);

    messageData = {
      ...messageData,
      keyId: channelKey.id,
      ciphertext,
      tag,
      iv,
    };
  }

  const message = await messageRepository.save(messageData);

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
    body: plaintext,
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
  const iv = crypto.randomBytes(AES_256_GCM_IV_LENGTH);
  const cipher = crypto.createCipheriv(AES_256_GCM_ALGORITHM, channelKey, iv);

  const ciphertext = Buffer.concat([cipher.update(message), cipher.final()]);
  const tag = cipher.getAuthTag();

  return { ciphertext, tag, iv };
};

const decryptMessage = (
  ciphertext: Buffer,
  tag: Buffer,
  iv: Buffer,
  channelKey: Buffer,
) => {
  const decipher = crypto.createDecipheriv(
    AES_256_GCM_ALGORITHM,
    channelKey,
    iv,
  );
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintext.toString();
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
