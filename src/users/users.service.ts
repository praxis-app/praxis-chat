// TODO: Add support for user deletion + clean up for saved image files

import { GENERAL_CHANNEL_NAME } from '@common/channels/channel.constants';
import { GENERATED_NAME_SEPARATOR } from '@common/users/user.constants';
import { FindManyOptions, In, IsNull, Like, Not } from 'typeorm';
import {
  colors,
  NumberDictionary,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import * as channelsService from '../channels/channels.service';
import { ChannelMember } from '../channels/entities/channel-member.entity';
import { normalizeText, sanitizeText } from '../common/text.utils';
import { dataSource } from '../database/data-source';
import { Image } from '../images/entities/image.entity';
import * as instanceRolesService from '../instance-roles/instance-roles.service';
import { Invite } from '../invites/invite.entity';
import * as serverRolesService from '../server-roles/server-roles.service';
import { Server } from '../servers/entities/server.entity';
import * as serversService from '../servers/servers.service';
import { UserProfileDto } from './dtos/user-profile.dto';
import { User } from './user.entity';
import { NATURE_DICTIONARY, SPACE_DICTIONARY } from './users.constants';

const userRepository = dataSource.getRepository(User);
const imageRepository = dataSource.getRepository(Image);
const channelMemberRepository = dataSource.getRepository(ChannelMember);
const serverRepository = dataSource.getRepository(Server);
const inviteRepository = dataSource.getRepository(Invite);

export const getCurrentUser = async (userId: string, includePerms = true) => {
  try {
    if (!userId) {
      throw new Error('User ID is missing or invalid');
    }
    const user = await userRepository.findOne({
      select: ['id', 'name', 'displayName', 'anonymous', 'locked'],
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    if (!includePerms) {
      return user;
    }

    let [
      instancePermissions,
      serverPermissions,
      profilePicture,
      currentServer,
    ] = await Promise.all([
      instanceRolesService.getInstancePermissionsByUser(userId),
      serverRolesService.getServerPermissionsByUser(userId),
      getUserProfilePicture(userId),
      getLastUsedServer(userId),
    ]);

    if (!currentServer) {
      const defaultServer = await serversService.getDefaultServer();
      currentServer = defaultServer;
    }

    const permissions = {
      instance: instancePermissions,
      servers: serverPermissions,
    };

    return {
      ...user,
      permissions,
      profilePicture,
      currentServer,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUserProfile = async (userId: string) => {
  const user = await userRepository.findOneOrFail({
    select: ['id', 'name', 'displayName', 'bio'],
    where: { id: userId },
  });

  const profilePicture = await getUserProfilePicture(userId);
  const coverPhoto = await getUserCoverPhoto(userId);

  return { ...user, profilePicture, coverPhoto };
};

export const getUserCount = async (options?: FindManyOptions<User>) => {
  return userRepository.count(options);
};

export const getLastUsedServer = async (userId: string) => {
  const server = await serverRepository.findOne({
    where: { members: { userId, lastActiveAt: Not(IsNull()) } },
    order: { members: { lastActiveAt: 'DESC' } },
    relations: ['members'],
    select: ['id', 'slug'],
  });
  if (!server) {
    return null;
  }
  return {
    id: server.id,
    slug: server.slug,
  };
};

export const isFirstUser = async () => {
  const userCount = await getUserCount({
    where: { anonymous: false },
  });
  return userCount === 0;
};

// TODO: Refactor - simplify `createUser`
export const createUser = async (
  email: string,
  name: string | undefined,
  password: string,
  inviteToken?: string,
) => {
  const isFirst = await isFirstUser();
  const user = await userRepository.save({
    name: name?.trim() || generateName(),
    email: normalizeText(email),
    password,
  });

  if (isFirst) {
    const server = await serversService.getDefaultServer();
    await serverRolesService.createAdminServerRole(server.id, user.id);
    await serversService.addMemberToServer(server.id, user.id);
    return user;
  }

  if (!inviteToken) {
    throw new Error('Invite token is required for non-first users');
  }
  const invite = await inviteRepository.findOneOrFail({
    where: { token: inviteToken },
  });
  await serversService.addMemberToServer(invite.serverId, user.id);

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

export const createAnonUser = async (serverId: string) => {
  const user = await userRepository.save({
    name: generateName(),
    anonymous: true,
  });
  const isFirst = await isFirstUser();

  if (isFirst) {
    await serverRolesService.createAdminServerRole(serverId, user.id);
    await serversService.addMemberToServer(serverId, user.id);
  } else {
    await channelsService.addMemberToGeneralChannel(serverId, user.id);
  }

  return user;
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

  const lastUsedServer = await getLastUsedServer(userId);
  if (!lastUsedServer) {
    throw new Error('Last used server not found for user');
  } else {
    await serversService.addMemberToServer(lastUsedServer.id, user.id);
  }
};

export const getUserProfilePicture = async (userId: string) => {
  return imageRepository.findOne({
    select: ['id', 'createdAt'],
    where: { userId, imageType: 'profile-picture' },
    order: { createdAt: 'DESC' },
  });
};

export const getUserCoverPhoto = async (userId: string) => {
  return imageRepository.findOne({
    select: ['id', 'createdAt'],
    where: { userId, imageType: 'cover-photo' },
    order: { createdAt: 'DESC' },
  });
};

/** Returns a map of profile pictures keyed by user ID */
export const getUserProfilePicturesMap = async (userIds: string[]) => {
  if (userIds.length === 0) {
    return {};
  }

  const images = await imageRepository.find({
    select: ['id', 'userId', 'imageType', 'createdAt'],
    where: { userId: In(userIds), imageType: 'profile-picture' },
    order: { userId: 'ASC', createdAt: 'DESC' },
  });

  const profilePicturesMap: Record<string, Image> = {};

  for (const image of images) {
    if (!image.userId) {
      throw new Error('User ID is missing - invalid SQL query');
    }
    if (!profilePicturesMap[image.userId]) {
      profilePicturesMap[image.userId] = image;
    }
  }

  return profilePicturesMap;
};

export const createUserProfilePicture = async (
  filename: string,
  userId: string,
) => {
  const image = await imageRepository.save({
    imageType: 'profile-picture',
    filename,
    userId,
  });
  return image;
};

export const createUserCoverPhoto = async (
  filename: string,
  userId: string,
) => {
  const image = await imageRepository.save({
    imageType: 'cover-photo',
    filename,
    userId,
  });
  return image;
};

export const isGeneralChannelMember = async (userId: string) => {
  const isMember = await channelMemberRepository.exist({
    where: {
      channel: {
        name: Like(`%${GENERAL_CHANNEL_NAME}%`),
      },
      userId,
    },
  });
  return isMember;
};

export const hasSharedChannel = async (userId: string, otherUserId: string) => {
  const userChannels = await channelMemberRepository.find({
    where: { userId: userId },
    select: ['channelId'],
  });

  const otherUserChannels = await channelMemberRepository.find({
    where: { userId: otherUserId },
    select: ['channelId'],
  });

  const userChannelIds = new Set(
    userChannels.map((member) => member.channelId),
  );

  for (const member of otherUserChannels) {
    if (userChannelIds.has(member.channelId)) {
      return true;
    }
  }

  return false;
};

const generateName = () => {
  const numberDictionary = NumberDictionary.generate({ min: 10, max: 99 });
  const nounDictionary =
    Math.random() >= 0.5 ? SPACE_DICTIONARY : NATURE_DICTIONARY;

  const name = uniqueNamesGenerator({
    dictionaries: [colors, nounDictionary, numberDictionary],
    separator: GENERATED_NAME_SEPARATOR,
  });

  return name;
};
