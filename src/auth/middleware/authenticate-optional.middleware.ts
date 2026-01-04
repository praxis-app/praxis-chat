import { NextFunction, Request, Response } from 'express';
import * as usersService from '../../users/users.service';
import * as authService from '../auth.service';

export const authenticateOptional = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { authorization } = req.headers;
    const [type, token] = authorization?.split(' ') || [];
    if (type === 'Bearer' && token) {
      const sub = authService.verifyAccessToken(token);
      const currentUser = await usersService.getCurrentUser(sub);
      if (currentUser) {
        res.locals.authenticated = true;
        res.locals.user = currentUser;
      }
    }
  } catch {
    // Ignore errors to allow public access
  } finally {
    next();
  }
};
