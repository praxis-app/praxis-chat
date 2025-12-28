import { NextFunction, Request, Response } from 'express';
import { dataSource } from '../../database/data-source';
import { getValidInvite } from '../../invites/invites.service';
import { ServerConfig } from '../../servers/server-configs/entities/server-config.entity';

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

  const serverConfig = await serverConfigRepository.findOne({
    where: { server: { invites: { token: inviteToken } } },
    select: ['id', 'anonymousUsersEnabled'],
  });

  if (!serverConfig?.anonymousUsersEnabled) {
    res.status(403).send('Anonymous users are not enabled for this server');
    return;
  }

  try {
    await getValidInvite(inviteToken);
  } catch (error) {
    res.status(403).send('Invalid invite token');
    return;
  }

  next();
};
