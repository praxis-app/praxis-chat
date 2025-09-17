import { serverConfigSchema } from '@common/server-configs/server-config.types';
import { NextFunction, Request, Response } from 'express';
import * as zod from 'zod';

export const validateServerConfig = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    serverConfigSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof zod.ZodError) {
      const errorMessage = error.issues[0]?.message || 'Validation failed';
      res.status(422).send(errorMessage);
      return;
    }
    res.status(500).send('Internal server error');
  }
};
