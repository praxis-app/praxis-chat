import { Request, Response } from 'express';
import * as fs from 'fs';
import * as imagesService from '../images/images.service';
import { getUploadsPath } from '../images/images.utils';
import { User } from './user.entity';
import * as usersService from './users.service';

export const getCurrentUser = async (_req: Request, res: Response) => {
  res.json({ user: res.locals.user });
};

export const getUserProfile = async (req: Request, res: Response) => {
  const currentUser: User = res.locals.user;
  const { userId } = req.params;

  if (currentUser.anonymous && userId !== currentUser.id) {
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

export const getUserImage = async (req: Request, res: Response) => {
  const currentUser: User | undefined = res.locals.user;

  const { userId, imageId } = req.params;
  const image = await imagesService.getImage(imageId);

  if (!image || image.userId !== userId) {
    res.status(404).send('Image not found');
    return;
  }

  if (image.imageType === 'profile-picture') {
    const isGeneralChannelMember =
      await usersService.isGeneralChannelMember(userId);

    if (!currentUser && !isGeneralChannelMember) {
      res.status(403).send('Forbidden');
      return;
    }
  }

  if (image.imageType === 'cover-photo') {
    let hasSharedChannel = false;
    if (currentUser) {
      hasSharedChannel = await usersService.hasSharedChannel(
        currentUser.id,
        userId,
      );
    }
    if (!hasSharedChannel) {
      res.status(403).send('Forbidden');
      return;
    }
  }

  if (!image.filename) {
    res.status(404).send('Image has not been uploaded yet');
    return;
  }

  const filePath = `${getUploadsPath()}/${image.filename}`;
  if (!fs.existsSync(filePath)) {
    res.status(404).send('Image file not found');
    return;
  }

  return res.sendFile(image.filename, {
    root: getUploadsPath(),
  });
};
