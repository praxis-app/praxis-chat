import { Request, Response } from 'express';
import * as usersService from './users.service';

export const getCurrentUser = async (_req: Request, res: Response) => {
  const { id, name, displayName, bio, anonymous, permissions } =
    res.locals.user;
  res.json({ user: { id, name, displayName, bio, anonymous, permissions } });
};

export const isFirstUser = async (_req: Request, res: Response) => {
  const isFirstUser = await usersService.isFirstUser();
  res.json({ isFirstUser });
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const user = await usersService.updateUserProfile(req.body, res.locals.user);
  res.json({ user });
};
