// TODO: Add support for user updates with validation

import { FindManyOptions, In } from 'typeorm';
import {
  colors,
  NumberDictionary,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import * as channelsService from '../channels/channels.service';
import { normalizeText, sanitizeText } from '../common/common.utils';
import { dataSource } from '../database/data-source';
import { Image } from '../images/entities/image.entity';
import * as rolesService from '../roles/roles.service';
import { createAdminRole } from '../roles/roles.service';
import { UserProfileDto } from './dtos/user-profile.dto';
import { User } from './user.entity';
import { NATURE_DICTIONARY, SPACE_DICTIONARY } from './users.constants';

const userRepository = dataSource.getRepository(User);
const imageRepository = dataSource.getRepository(Image);

export const getCurrentUser = async (userId: string, includePerms = true) => {
  try {
    if (!userId) {
      throw new Error('User ID is missing or invalid');
    }
    const user = await userRepository.findOneOrFail({
      select: ['id', 'name', 'displayName', 'bio', 'anonymous'],
      where: { id: userId },
    });
    if (!includePerms) {
      return user;
    }

    const permissions = await rolesService.getUserPermissions(userId);
    const profilePicture = await getUserProfilePicture(userId);

    return {
      ...user,
      permissions,
      profilePicture,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUserCount = async (options?: FindManyOptions<User>) => {
  return userRepository.count(options);
};

export const isFirstUser = async () => {
  const userCount = await getUserCount({
    where: { anonymous: false },
  });
  return userCount === 0;
};

export const createUser = async (
  email: string,
  name: string | undefined,
  password: string,
) => {
  const isFirst = await isFirstUser();
  const user = await userRepository.save({
    name: name?.trim() || generateName(),
    email: normalizeText(email),
    password,
  });

  if (isFirst) {
    await createAdminRole(user.id);
  }
  await channelsService.addMemberToAllChannels(user.id);

  return user;
};

export const updateUserProfile = async (
  { name, displayName, bio }: UserProfileDto,
  currentUser: User,
) => {
  const sanitizedName = sanitizeText(name);
  const sanitizedDisplayName = sanitizeText(displayName);
  const sanitizedBio = sanitizeText(bio);

  await userRepository.update(currentUser.id, {
    displayName: sanitizedDisplayName,
    name: sanitizedName,
    bio: sanitizedBio,
  });
};

export const upgradeAnonUser = async (
  userId: string,
  email: string,
  password: string,
  name?: string,
) => {
  const user = await userRepository.findOne({
    where: { id: userId },
  });
  if (!user) {
    throw new Error('User not found');
  }
  // Upgrade existing anon user to a registered user
  await userRepository.update(userId, {
    ...user,
    anonymous: false,
    email: normalizeText(email),
    name: name?.trim(),
    password,
  });

  await channelsService.addMemberToAllChannels(user.id);
};

export const createAnonUser = async () => {
  const user = await userRepository.save({
    name: generateName(),
    anonymous: true,
  });
  const isFirst = await isFirstUser();

  if (isFirst) {
    await createAdminRole(user.id);
    await channelsService.addMemberToAllChannels(user.id);
  } else {
    await channelsService.addMemberToGeneralChannel(user.id);
  }

  return user;
};

export const getUserProfilePicture = async (userId: string) => {
  return imageRepository.findOne({
    select: ['id', 'createdAt'],
    where: { userId, imageType: 'profile-picture' },
    order: { createdAt: 'DESC' },
  });
};

// TODO: Implement - is currently a WIP
export const getUserImagesMap = async (userIds: string[]) => {
  if (userIds.length === 0) {
    return {};
  }

  // Fetch all profile pictures and cover photos for the given user IDs
  const images = await imageRepository.find({
    select: ['id', 'userId', 'imageType', 'createdAt'],
    where: [
      { userId: In(userIds), imageType: 'profile-picture' },
      { userId: In(userIds), imageType: 'cover-photo' },
    ],
    order: { userId: 'ASC', imageType: 'ASC', createdAt: 'DESC' },
  });

  // Initialize map with null values for all requested user IDs
  const imagesMap: Record<
    string,
    { profilePictureId: string | null; coverPhotoId: string | null }
  > = {};

  userIds.forEach((userId) => {
    imagesMap[userId] = { profilePictureId: null, coverPhotoId: null };
  });

  // Process images and keep only the latest of each type per user
  // Since images are ordered by createdAt DESC, the first occurrence of each user+type combination is the latest
  const processedKeys = new Set<string>();

  images.forEach((image) => {
    if (!image.userId) return; // Skip images without userId

    const key = `${image.userId}-${image.imageType}`;

    // Only process the first occurrence (latest) of each user+type combination
    if (!processedKeys.has(key)) {
      processedKeys.add(key);

      if (image.imageType === 'profile-picture') {
        imagesMap[image.userId].profilePictureId = image.id;
      } else if (image.imageType === 'cover-photo') {
        imagesMap[image.userId].coverPhotoId = image.id;
      }
    }
  });

  return imagesMap;
};

export const uploadUserProfilePicture = async (
  filename: string,
  userId: string,
) => {
  const image = await imageRepository.save({
    filename,
    imageType: 'profile-picture',
    userId,
  });
  return image;
};

const generateName = () => {
  const numberDictionary = NumberDictionary.generate({ min: 10, max: 99 });
  const nounDictionary =
    Math.random() >= 0.5 ? SPACE_DICTIONARY : NATURE_DICTIONARY;

  const name = uniqueNamesGenerator({
    dictionaries: [colors, nounDictionary, numberDictionary],
    separator: '-',
  });

  return name;
};
