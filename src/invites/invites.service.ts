import cryptoRandomString from 'crypto-random-string';
import { dataSource } from '../database/data-source';
import { User } from '../users/user.entity';
import * as usersService from '../users/users.service';
import { Invite } from './invite.entity';

const INVITES_PAGE_SIZE = 20;

interface CreateInviteDto {
  maxUses?: number;
  expiresAt?: number;
}

const inviteRepository = dataSource.getRepository(Invite);

export const getValidInvite = async (token: string) => {
  const invite = await inviteRepository.findOne({
    where: { token },
  });
  if (!invite) {
    throw new Error('Invite not found');
  }
  const isValid = validateInvite(invite);
  if (!isValid) {
    throw new Error('Invalid server invite');
  }
  return invite;
};

export const getValidInvites = async () => {
  const invites = await inviteRepository
    .createQueryBuilder('invite')
    .leftJoinAndSelect('invite.user', 'user')
    .select([
      'invite.id',
      'invite.maxUses',
      'invite.token',
      'invite.uses',
      'invite.expiresAt',
      'user.id',
      'user.name',
      'user.displayName',
    ])
    .orderBy('invite.createdAt', 'DESC')
    .getMany();

  // TOOD: Move filtering logic to query
  const validInvites = invites.filter((invite) => {
    return validateInvite(invite);
  });

  const userImagesMap = await usersService.getUserProfilePicturesMap(
    validInvites.map((invite) => invite.user.id),
  );

  const shapedInvites = validInvites.map((invite) => ({
    ...invite,
    user: {
      ...invite.user,
      profilePicture: userImagesMap[invite.user.id],
    },
  }));

  // TODO: Update once pagination has been implemented
  return shapedInvites.slice(0, INVITES_PAGE_SIZE);
};

export const createInvite = async (inviteData: CreateInviteDto, user: User) => {
  const token = cryptoRandomString({ length: 8 });
  const invite = await inviteRepository.save({
    ...inviteData,
    userId: user.id,
    token,
  });

  const profilePicture = await usersService.getUserProfilePicture(user.id);
  const coverPhoto = await usersService.getUserCoverPhoto(user.id);

  return {
    ...invite,
    user: {
      ...user,
      profilePicture,
      coverPhoto,
    },
  };
};

export const redeemInvite = async (token: string) => {
  await inviteRepository.increment({ token }, 'uses', 1);
};

export const deleteInvite = async (inviteId: string) => {
  return inviteRepository.delete(inviteId);
};

export const validateInvite = (invite: Invite) => {
  const isExpired = invite.expiresAt && Date.now() >= Number(invite.expiresAt);
  const maxUsesReached = invite.maxUses && invite.uses >= invite.maxUses;

  if (isExpired || maxUsesReached) {
    return false;
  }
  return true;
};
