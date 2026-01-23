import { NextFunction, Request, Response } from 'express';
import { dataSource } from '../../database/data-source';
import { Invite } from '../../invites/invite.entity';
import { isValidInvite } from '../../invites/invites.service';
import { ServerConfig } from '../../servers/server-configs/entities/server-config.entity';

const inviteRepository = dataSource.getRepository(Invite);
const serverConfigRepository = dataSource.getRepository(ServerConfig);

export const validateCreateAnon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const inviteToken: string | undefined = req.body.inviteToken;

  if (!inviteToken) {
    res.status(403).send('You need an invite to sign up');
    return;
  }

  const isValid = await isValidInvite({ token: inviteToken });
  if (!isValid) {
    res.status(403).send('Invalid invite token');
    return;
  }

  const invite = await inviteRepository.findOne({
    where: { token: inviteToken },
    select: ['id', 'serverId'],
  });
  if (!invite) {
    res.status(403).send('Invalid invite token');
    return;
  }

  const serverConfig = await serverConfigRepository.findOne({
    where: { serverId: invite.serverId },
    select: ['id', 'anonymousUsersEnabled'],
  });
  if (!serverConfig?.anonymousUsersEnabled) {
    res.status(403).send('Anonymous users are not enabled for this server');
    return;
  }

  next();
};
