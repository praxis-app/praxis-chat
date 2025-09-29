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
import { CreateMessageDto } from './message.types';

enum MessageType {
  MESSAGE = 'message',
  IMAGE = 'image',
}

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
      'message.createdAt',
    ])
    .addSelect([
      'messageUser.id',
      'messageUser.name',
      'messageUser.displayName',
    ])
    .addSelect([
      'messageUserImage.id',
      'messageUserImage.filename',
      'messageUserImage.imageType',
      'messageUserImage.createdAt',
    ])
    .addSelect([
      'messageImage.id',
      'messageImage.filename',
      'messageImage.createdAt',
    ])
    .leftJoin('message.user', 'messageUser')
    .leftJoin('messageUser.images', 'messageUserImage')
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

  const decryptedMessages = messages.map(
    ({ ciphertext, tag, iv, keyId, ...message }) => {
      let body: string | null = null;

      if (ciphertext && tag && iv && keyId) {
        const unwrappedKey = unwrappedKeyMap[keyId];
        body = decryptMessage(ciphertext, tag, iv, unwrappedKey);
      }

      const { images: userImages, ...user } = message.user;
      const profilePicture = userImages.find(
        (image) => image.imageType === 'profile-picture',
      );
      const coverPhoto = userImages.find(
        (image) => image.imageType === 'cover-photo',
      );

      return {
        ...message,
        images: message.images.map((image) => ({
          id: image.id,
          isPlaceholder: !image.filename,
          createdAt: image.createdAt,
        })),
        user: {
          ...user,
          profilePictureId: profilePicture?.id,
          coverPhotoId: coverPhoto?.id,
        },
        body,
      };
    },
  );

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
      return imageRepository.create({
        messageId: message.id,
        imageType: 'message',
      });
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
    user: { id: user.id, name: user.name, displayName: user.displayName },
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
