import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs';
import * as imagesService from '../images.service';
import { getUploadsPath } from '../images.utils';

export const verifyImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { imageId } = req.params;
  const image = await imagesService.getImage(imageId);

  if (!image) {
    res.status(404).send('Image not found');
    return;
  }

  // Determine ownership based on which foreign key is set on the image
  let ownershipValid = false;
  if (image.messageId && req.params.messageId) {
    ownershipValid = image.messageId === req.params.messageId;
  }
  if (image.pollId && req.params.pollId) {
    ownershipValid = image.pollId === req.params.pollId;
  }
  if (image.userId && req.params.userId) {
    ownershipValid = image.userId === req.params.userId;
  }

  if (!ownershipValid) {
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

  res.locals.image = image;
  next();
};
