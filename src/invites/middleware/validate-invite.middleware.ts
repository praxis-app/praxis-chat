import { NextFunction, Request, Response } from 'express';
import * as invitesService from '../invites.service';

export const validateInvite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { inviteToken } = req.params;
  const resolvedInviteToken = inviteToken || req.body.inviteToken;

  if (!resolvedInviteToken) {
    res.status(400).send('Invite token is required');
    return;
  }

  const isValid = await invitesService.isValidInvite({
    token: resolvedInviteToken,
  });
  if (!isValid) {
    res.status(400).send('Invalid invite token');
    return;
  }

  next();
};
