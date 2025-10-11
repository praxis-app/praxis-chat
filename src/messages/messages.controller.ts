import { Request, Response } from 'express';
import * as fs from 'fs';
import * as imagesService from '../images/images.service';
import { getUploadsPath } from '../images/images.utils';
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

export const getMessageImage = async (req: Request, res: Response) => {
  const { messageId, imageId } = req.params;

  const image = await imagesService.getImage(imageId);

  if (!image || image.messageId !== messageId) {
    res.status(404).send('Image not found');
    return;
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
