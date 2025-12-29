import { Request, Response } from 'express';
import * as invitesService from './invites.service';

export const getInvites = async (req: Request, res: Response) => {
  const invites = await invitesService.getValidInvites(req.params.serverId);
  res.json({ invites });
};

export const isValidInvite = async (req: Request, res: Response) => {
  const isValidInvite = await invitesService.isValidInvite(req.params.token);
  res.json({ isValidInvite });
};

export const createInvite = async (req: Request, res: Response) => {
  const invite = await invitesService.createInvite(
    req.params.serverId,
    req.body,
    res.locals.user,
  );
  res.json({ invite });
};

export const deleteInvite = async (req: Request, res: Response) => {
  const result = await invitesService.deleteInvite(
    req.params.serverId,
    req.params.inviteId,
  );
  res.json(result);
};
