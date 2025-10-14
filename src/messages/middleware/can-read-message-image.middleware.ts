import { NextFunction, Request, Response } from 'express';
import { GENERAL_CHANNEL_NAME } from '../../../common/channels/channel.constants';
import { dataSource } from '../../database/data-source';
import * as imagesService from '../../images/images.service';
import { User } from '../../users/user.entity';
import { Message } from '../message.entity';

const messageRepository = dataSource.getRepository(Message);

export const canReadMessageImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const currentUser: User | undefined = res.locals.user;
  const { messageId, imageId } = req.params;

  const image = await imagesService.getImage(imageId);

  if (!image || image.messageId !== messageId) {
    res.status(404).send('Image not found');
    return;
  }

  if (!currentUser) {
    const isGeneralChannelMessage = await messageRepository.exist({
      where: { id: messageId, channel: { name: GENERAL_CHANNEL_NAME } },
    });
    if (!isGeneralChannelMessage) {
      res.status(403).send('Forbidden');
      return;
    }
  }

  next();
};
