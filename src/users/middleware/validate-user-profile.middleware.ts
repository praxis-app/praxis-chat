import { NextFunction, Request, Response } from 'express';
import * as zod from 'zod';
import {
  MAX_BIO_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_NAME_LENGTH,
  MIN_DISPLAY_NAME_LENGTH,
  MIN_NAME_LENGTH,
  VALID_NAME_REGEX,
} from '../users.constants';

const userProfileSchema = zod.object({
  name: zod
    .string()
    .min(MIN_NAME_LENGTH)
    .max(MAX_NAME_LENGTH)
    .regex(VALID_NAME_REGEX)
    .optional(),
  displayName: zod
    .string()
    .min(MIN_DISPLAY_NAME_LENGTH)
    .max(MAX_DISPLAY_NAME_LENGTH)
    .optional(),
  bio: zod.string().max(MAX_BIO_LENGTH).optional(),
});

export const validateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    userProfileSchema.parse(req.body);
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
