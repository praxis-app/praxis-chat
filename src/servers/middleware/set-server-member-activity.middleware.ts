import { NextFunction, Request, Response } from 'express';
import { dataSource } from '../../database/data-source';
import { User } from '../../users/user.entity';
import { ServerMember } from '../entities/server-member.entity';
import { Server } from '../entities/server.entity';

const serverMemberRepository = dataSource.getRepository(ServerMember);
const serverRepository = dataSource.getRepository(Server);

export const setServerMemberActivity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const currentUser: User | undefined = res.locals.user;
  const params = req.params as { serverId?: string; slug?: string };

  let serverId = params.serverId;

  if (!currentUser?.id) {
    res.status(400).send('Current user ID is required');
    return;
  }

  // Allow slug-only routes: resolve serverId from slug when serverId is missing
  if (!serverId && params.slug) {
    const server = await serverRepository.findOne({
      where: { slug: params.slug },
    });
    serverId = server?.id;
  }

  if (!serverId) {
    res.status(404).send('Server not found');
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
