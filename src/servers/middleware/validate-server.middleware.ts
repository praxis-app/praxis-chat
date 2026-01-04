import { serverFormSchema } from '@common/servers/server.types';
import { NextFunction, Request, Response } from 'express';
import * as zod from 'zod';

export const validateServer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    serverFormSchema.parse(req.body);
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
