import { NextFunction, Request, Response } from 'express';
import * as channelsService from '../../channels/channels.service';
import * as imagesService from '../../images/images.service';
import { User } from '../../users/user.entity';
import * as messagesService from '../messages.service';

export const canReadMessageImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const currentUser: User | undefined = res.locals.user;
  const { serverId, channelId, messageId, imageId } = req.params;

  const image = await imagesService.getImage(imageId);

  if (!image || image.messageId !== messageId) {
    res.status(404).send('Image not found');
    return;
  }

  if (currentUser) {
    const isChannelMember = await channelsService.isChannelMember(
      channelId,
      currentUser.id,
    );
    if (!isChannelMember) {
      res.status(403).send('Forbidden');
      return;
    }
  } else {
    const isPublicChannelMessage = await messagesService.isPublicChannelMessage(
      serverId,
      channelId,
      messageId,
    );
    if (!isPublicChannelMessage) {
      res.status(403).send('Forbidden');
      return;
    }
  }

  next();
};
