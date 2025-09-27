// TODO: Add support for user updates with validation

import { FindManyOptions } from 'typeorm';
import {
  colors,
  NumberDictionary,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import * as channelsService from '../channels/channels.service';
import { normalizeText, sanitizeText } from '../common/common.utils';
import { dataSource } from '../database/data-source';
import { createAdminRole } from '../roles/roles.service';
import { User } from './user.entity';
import { NATURE_DICTIONARY, SPACE_DICTIONARY } from './users.constants';

const userRepository = dataSource.getRepository(User);

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

export const updateUser = async (currentUser: User, input: any) => {
  const { name, displayName, bio } = input;

  const sanitizedName = sanitizeText(name);
  const sanitizedDisplayName = sanitizeText(displayName);
  const sanitizedBio = sanitizeText(bio);

  // TODO: Move to validation middleware
  const usersWithNameCount = await getUserCount({ where: { name } });
  if (currentUser.name !== name && usersWithNameCount > 0) {
    throw new Error('Username is already in use');
  }

  await userRepository.update(currentUser.id, {
    displayName: sanitizedDisplayName,
    name: sanitizedName,
    bio: sanitizedBio,
  });

  // if (profilePicture) {
  //   await saveProfilePicture(currentUser.id, profilePicture);
  // }
  // if (coverPhoto) {
  //   await saveCoverPhoto(currentUser.id, coverPhoto);
  // }
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
