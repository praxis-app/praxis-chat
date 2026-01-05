import cryptoRandomString from 'crypto-random-string';
import { FindOptionsWhere } from 'typeorm';
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

export const isValidInvite = async (where: FindOptionsWhere<Invite>) => {
  const invite = await inviteRepository.findOne({
    select: ['id', 'maxUses', 'uses', 'expiresAt'],
    where,
  });
  if (!invite) {
    return false;
  }
  return validateInvite(invite);
};

export const getValidInvites = async (serverId: string) => {
  const invites = await inviteRepository
    .createQueryBuilder('invite')
    .where('invite.serverId = :serverId', { serverId })
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

  const profilePictures = await usersService.getUserProfilePicturesMap(
    validInvites.map((invite) => invite.user.id),
  );

  const shapedInvites = validInvites.map((invite) => ({
    ...invite,
    user: {
      ...invite.user,
      profilePicture: profilePictures[invite.user.id],
    },
  }));

  // TODO: Update once pagination has been implemented
  return shapedInvites.slice(0, INVITES_PAGE_SIZE);
};

export const createInvite = async (
  serverId: string,
  inviteData: CreateInviteDto,
  user: User,
) => {
  const token = cryptoRandomString({ length: 8 });

  const invite = await inviteRepository.save({
    ...inviteData,
    userId: user.id,
    serverId,
    token,
  });

  const profilePicture = await usersService.getUserProfilePicture(user.id);

  return {
    ...invite,
    user: {
      ...user,
      profilePicture,
    },
  };
};

export const redeemInvite = async (token: string) => {
  await inviteRepository.increment({ token }, 'uses', 1);
};

export const deleteInvite = async (serverId: string, inviteId: string) => {
  return inviteRepository.delete({ id: inviteId, serverId });
};

export const validateInvite = (invite: Invite) => {
  const isExpired = invite.expiresAt && Date.now() >= Number(invite.expiresAt);
  const maxUsesReached = invite.maxUses && invite.uses >= invite.maxUses;

  if (isExpired || maxUsesReached) {
    return false;
  }
  return true;
};
