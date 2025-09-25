// TODO: Add error handling to all endpoints

import { Request, Response } from 'express';
import * as authService from './auth.service';

export const login = async (req: Request, res: Response) => {
  const access_token = await authService.login(req.body);
  res.json({ access_token });
};

export const signUp = async (req: Request, res: Response) => {
  const access_token = await authService.signUp(req.body);
  res.json({ access_token });
};

export const createAnonSession = async (req: Request, res: Response) => {
  const access_token = await authService.createAnonSession(
    req.body.inviteToken,
  );
  res.json({ access_token });
};

export const upgradeAnonSession = async (req: Request, res: Response) => {
  const { user } = res.locals;
  await authService.upgradeAnonSession(req.body, user.id);
  res.sendStatus(204);
};

export const logOut = async (_req: Request, res: Response) => {
  res.setHeader('Clear-Site-Data', '"storage"');
  res.sendStatus(204);
};
