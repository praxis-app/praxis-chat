import { NextFunction, Request, Response } from 'express';
import { getCurrentUser } from '../../users/users.service';
import { verifyAccessToken } from '../auth.service';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { authorization } = req.headers;
  const [type, token] = authorization?.split(' ') ?? [];
  if (type !== 'Bearer' || !token) {
    res.status(401).send('Unauthorized');
    return;
  }
  const sub = verifyAccessToken(token);
  const user = await getCurrentUser(sub);
  if (!user) {
    res.status(401).send('Unauthorized');
    return;
  }
  res.locals.user = user;
  next();
};
