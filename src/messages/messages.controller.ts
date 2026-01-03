import { Request, Response } from 'express';
import { Image } from '../images/entities/image.entity';
import { getUploadsPath } from '../images/images.utils';
import * as messagesService from './messages.service';

export const createMessage = async (req: Request, res: Response) => {
  const { serverId, channelId } = req.params;
  const message = await messagesService.createMessage(
    serverId,
    channelId,
    req.body,
    res.locals.user,
  );
  res.json({ message });
};

export const uploadMessageImage = async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(422).send('No image uploaded');
    return;
  }
  const { user } = res.locals;
  const { messageId, imageId } = req.params;
  const { filename } = req.file as Express.Multer.File;
  const image = await messagesService.saveMessageImage(
    messageId,
    imageId,
    filename,
    user,
  );

  res.status(201).json({ image });
};

export const getMessageImage = async (_req: Request, res: Response) => {
  const image: Image & { filename: string } = res.locals.image;

  return res.sendFile(image.filename, {
    root: getUploadsPath(),
  });
};
