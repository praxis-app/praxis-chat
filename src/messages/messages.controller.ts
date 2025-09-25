import { Request, Response } from 'express';
import * as messagesService from './messages.service';

export const createMessage = async (req: Request, res: Response) => {
  const message = await messagesService.createMessage(
    req.params.channelId,
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
