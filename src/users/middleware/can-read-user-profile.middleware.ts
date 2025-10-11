import { NextFunction, Request, Response } from 'express';
import { User } from '../user.entity';
import * as usersService from '../users.service';

export const canReadUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const currentUser: User = res.locals.user;
  const { userId } = req.params;

  if (userId === currentUser.id) {
    next();
    return;
  }

  if (currentUser.anonymous) {
    res.status(403).send('Forbidden');
    return;
  }

  const hasSharedChannel = await usersService.hasSharedChannel(
    currentUser.id,
    userId,
  );

  if (!hasSharedChannel) {
    res.status(403).send('Forbidden');
    return;
  }

  next();
};
