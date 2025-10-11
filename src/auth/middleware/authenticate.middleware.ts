import { NextFunction, Request, Response } from 'express';
import * as userService from '../../users/users.service';
import * as authService from '../auth.service';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // User has already been authenticated
  if (res.locals.authenticated) {
    next();
    return;
  }

  // Check authorization header shape
  const { authorization } = req.headers;
  const [type, token] = authorization?.split(' ') ?? [];
  if (type !== 'Bearer' || !token) {
    res.status(401).send('Unauthorized');
    return;
  }

  // Verify access token and subject claim
  const sub = authService.verifyAccessToken(token);
  const currentUser = await userService.getCurrentUser(sub);
  if (!currentUser) {
    res.status(401).send('Unauthorized');
    return;
  }

  // Set response locals for authenticated user
  res.locals.authenticated = true;
  res.locals.user = currentUser;
  next();
};
