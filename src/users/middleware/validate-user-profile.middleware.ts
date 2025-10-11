import {
  BIO_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  VALID_NAME_REGEX,
} from '@common/users/user.constants';
import { NextFunction, Request, Response } from 'express';
import * as zod from 'zod';
import { UserProfileDto } from '../dtos/user-profile.dto';
import { getUserCount } from '../users.service';

const userProfileSchema = zod.object({
  name: zod
    .string()
    .min(NAME_MIN_LENGTH)
    .max(NAME_MAX_LENGTH)
    .regex(VALID_NAME_REGEX)
    .optional(),
  displayName: zod
    .union([
      zod.string().min(DISPLAY_NAME_MIN_LENGTH).max(DISPLAY_NAME_MAX_LENGTH),
      zod.literal(''),
    ])
    .optional(),
  bio: zod.string().max(BIO_MAX_LENGTH).optional(),
});

export const validateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Validate request body shape
    userProfileSchema.parse(req.body);

    // Validate username is unique
    const { name } = req.body as UserProfileDto;
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
