import { NextFunction, Request, Response } from 'express';
import * as imagesService from '../../images/images.service';
import * as serversService from '../../servers/servers.service';
import { User } from '../user.entity';
import * as usersService from '../users.service';

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
    const isDefaultServerMember =
      await serversService.isDefaultServerMember(userId);

    if (!currentUser && !isDefaultServerMember) {
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

  next();
};
