import { NextFunction, Request, Response } from 'express';
import * as zod from 'zod';

const userProfileSchema = zod.object({
  name: zod.string().optional(),
  displayName: zod.string().optional(),
  bio: zod.string().optional(),
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
