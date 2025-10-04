import { Request, Response } from 'express';
import * as usersService from './users.service';

export const getCurrentUser = async (_req: Request, res: Response) => {
  res.json({ user: res.locals.user });
};

export const getUserProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const user = await usersService.getUserProfile(userId);

  if (!user) {
    res.status(404).send('User not found');
    return;
  }

  res.json({ user });
};

export const isFirstUser = async (_req: Request, res: Response) => {
  const isFirstUser = await usersService.isFirstUser();
  res.json({ isFirstUser });
};

export const updateUserProfile = async (req: Request, res: Response) => {
  const user = await usersService.updateUserProfile(req.body, res.locals.user);
  res.json({ user });
};

export const createUserProfilePicture = async (req: Request, res: Response) => {
  // TODO: Move validation to middleware
  if (!req.file) {
    res.status(422).send('No image uploaded');
    return;
  }

  const image = await usersService.createUserProfilePicture(
    req.file.filename,
    res.locals.user.id,
  );

  res.status(201).json({ image });
};

export const createUserCoverPhoto = async (req: Request, res: Response) => {
  // TODO: Move validation to middleware
  if (!req.file) {
    res.status(422).send('No image uploaded');
    return;
  }

  const image = await usersService.createUserCoverPhoto(
    req.file.filename,
    res.locals.user.id,
  );

  res.status(201).json({ image });
};
