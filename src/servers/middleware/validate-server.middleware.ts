import { NextFunction, Request, Response } from 'express';
import * as zod from 'zod';

const serverSchema = zod.object({
  name: zod.string().min(2).max(20),
  slug: zod
    .string()
    .min(2)
    .max(20)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
      error: 'Invalid slug format',
    }),
  description: zod.string().optional(),
});

export const validateServer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    serverSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof zod.ZodError) {
      const errorMessage =
        error.issues[0]?.message || 'Validation failed for server';
      res.status(422).send(errorMessage);
      return;
    }
    res.status(500).send('Internal server error');
  }
};
