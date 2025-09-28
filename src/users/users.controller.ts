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

export const getUserProfilePicture = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const image = await usersService.getUserProfilePicture(userId);

  if (!image) {
    res.json({ image: null });
    return;
  }

  res.json({ image });
};

export const uploadUserProfilePicture = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(422).send('No image uploaded');
    return;
  }

  const { filename } = req.file as Express.Multer.File;
  const { user } = res.locals;
  const image = await usersService.uploadUserProfilePicture(filename, user.id);

  res.status(201).json({ image });
};
