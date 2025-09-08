import { NextFunction, Request, Response } from 'express';
import { getValidInvite } from '../../invites/invites.service';
import { getUserCount } from '../../users/users.service';
import { SignUpDto } from '../auth.service';

export const validateCreateAnon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { inviteToken } = req.body as SignUpDto;

  const userCount = await getUserCount();
  if (userCount && !inviteToken) {
    res.status(403).send('You need an invite to sign up');
    return;
  }

  if (inviteToken) {
    try {
      await getValidInvite(inviteToken);
    } catch (error) {
      res.status(403).send('Invalid invite token');
      return;
    }
  }

  next();
};
