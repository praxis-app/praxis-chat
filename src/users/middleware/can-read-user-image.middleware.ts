import { NextFunction, Request, Response } from 'express';
import { User } from '../user.entity';
import * as usersService from '../users.service';
import { getUploadsPath } from '../../images/images.utils';
import * as imagesService from '../../images/images.service';
import fs from 'fs';

export const canReadUserImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

  res.locals.image = image;
  next();
};
