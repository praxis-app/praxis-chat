import { NextFunction, Request, Response } from 'express';
import { sanitizeText } from '../../common/common.utils';
import { CreateChannelDto } from '../channels.service';

/** Channel names can only contain letters, numbers, and hyphens */
const VALID_CHANNEL_NAME_REGEX = /^[A-Za-z0-9-]+$/;

const CHANNEL_NAME_MAX = 25;
const CHANNEL_DESCRIPTION_MAX = 2000;

export const validateChannel = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { name, description } = req.body as CreateChannelDto;
  if (typeof name !== 'string') {
    res.status(422).send('Channel name must be a string');
    return;
  }

  // Channel name validation
  const sanitizedName = sanitizeText(name);
  if (sanitizedName.length > CHANNEL_NAME_MAX) {
    const message = `Channel name cannot exceed ${CHANNEL_NAME_MAX} characters`;
    res.status(422).send(message);
    return;
  }
  if (!VALID_CHANNEL_NAME_REGEX.test(sanitizedName)) {
    const message = `Channel names can only contain letters, numbers, and hyphens`;
    res.status(422).send(message);
    return;
  }

  // Channel description validation
  const sanitizedDescription = sanitizeText(description);
  if (description && typeof description !== 'string') {
    res.status(422).send('Channel description must be a string');
    return;
  }
  if (description && sanitizedDescription.length > CHANNEL_DESCRIPTION_MAX) {
    const message = `Channel description cannot exceed ${CHANNEL_DESCRIPTION_MAX} characters`;
    res.status(422).send(message);
    return;
  }

  next();
};
