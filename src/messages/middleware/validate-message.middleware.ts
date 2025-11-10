// TODO: Leverage zod to validate the request body

import { NextFunction, Request, Response } from 'express';
import { sanitizeText } from '../../common/text.utils';
import { CreateMessageDto } from '../message.types';

const MESSAGE_BODY_MAX = 6000;
const MESSAGE_IMAGE_COUNT_MAX = 5;

export const validateMessage = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const message = req.body as CreateMessageDto;
  if (typeof message.imageCount !== 'number') {
    res.status(422).send('Image count must be a number');
    return;
  }
  if (message.imageCount < 0 || message.imageCount > MESSAGE_IMAGE_COUNT_MAX) {
    const message = `Image count must be between 0 and ${MESSAGE_IMAGE_COUNT_MAX}`;
    res.status(422).send(message);
    return;
  }
  if (message.body && typeof message.body !== 'string') {
    res.status(422).send('Message body must be a string');
    return;
  }
  const sanitizedBody = sanitizeText(message.body);
  if (message.body && sanitizedBody.length > MESSAGE_BODY_MAX) {
    const message = `Message body cannot exceed ${MESSAGE_BODY_MAX} characters`;
    res.status(422).send(message);
    return;
  }
  if (!sanitizedBody && !message.imageCount) {
    res.status(422).send('Message body or images are required');
    return;
  }
  next();
};
