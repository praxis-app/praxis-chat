import {
  MAX_BIO_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_NAME_LENGTH,
  MIN_DISPLAY_NAME_LENGTH,
  MIN_NAME_LENGTH,
  VALID_NAME_REGEX,
} from '@common/users/users.constants';
import { NextFunction, Request, Response } from 'express';
import * as zod from 'zod';
import { getUserCount } from '../users.service';

const userProfileSchema = zod.object({
  name: zod
    .string()
    .min(MIN_NAME_LENGTH)
    .max(MAX_NAME_LENGTH)
    .regex(VALID_NAME_REGEX)
    .optional(),
  displayName: zod
    .union([
      zod.string().min(MIN_DISPLAY_NAME_LENGTH).max(MAX_DISPLAY_NAME_LENGTH),
      zod.literal(''),
    ])
    .optional(),
  bio: zod.string().max(MAX_BIO_LENGTH).optional(),
});

export const validateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Validate user sign up is completed
    if (res.locals.user.anonymous) {
      res.status(403).send('User sign up must be completed to update profile');
      return;
    }

    // Validate request body shape
    userProfileSchema.parse(req.body);

    // Validate username is unique
    const { name } = req.body;
    if (name) {
      const usersWithNameCount = await getUserCount({
        where: { name },
      });
      if (res.locals.user.name !== name && usersWithNameCount > 0) {
        throw new Error('Username is already in use');
      }
    }

    next();
  } catch (error) {
    if (error instanceof zod.ZodError) {
      const errorMessage =
        error.issues[0]?.message || 'Validation failed for user profile';
      res.status(422).send(errorMessage);
      return;
    }
    res.status(500).send('Internal server error');
  }
};
