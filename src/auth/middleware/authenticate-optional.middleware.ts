import { NextFunction, Request, Response } from 'express';
import { getAuthedUser, verifyAccessToken } from '../auth.service';

export const authenticateOptional = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { authorization } = req.headers;
    const [type, token] = authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) {
      const sub = verifyAccessToken(token);
      const user = await getAuthedUser(sub);
      if (user) {
        res.locals.user = user;
      }
    }
  } catch {
    // Ignore errors to allow public access
  } finally {
    next();
  }
};
