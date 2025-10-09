import { NextFunction, Request, Response } from 'express';
import * as userService from '../../users/users.service';
import * as authService from '../auth.service';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // If user exists, user is already authed
  if (res.locals.user) {
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

  // Set current user in response locals
  res.locals.user = currentUser;
  next();
};
