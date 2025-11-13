import { NextFunction, Request, Response } from 'express';
import { dataSource } from '../../database/data-source';
import { User } from '../../users/user.entity';
import { ServerMember } from '../entities/server-member.entity';

const serverMemberRepository = dataSource.getRepository(ServerMember);

export const setServerMemberLastActiveAt = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const currentUser: User = res.locals.user;
  const { serverId } = req.params;

  if (!currentUser.id || !serverId) {
    res.status(400).send('Current user ID and server ID are required');
    return;
  }

  const serverMember = await serverMemberRepository.findOne({
    where: { userId: currentUser.id, serverId },
  });

  if (!serverMember) {
    res.status(404).send('Server member not found');
    return;
  }

  await serverMemberRepository.update(serverMember.id, {
    lastActiveAt: new Date(),
  });

  next();
};
