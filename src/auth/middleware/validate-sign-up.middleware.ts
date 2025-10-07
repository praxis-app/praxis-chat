// TODO: Leverage zod for validation

import {
  EMAIL_MAX_LENGTH,
  MAX_NAME_LENGTH,
  MIN_NAME_LENGTH,
  VALID_EMAIL_REGEX,
  VALID_NAME_REGEX,
} from '@common/users/users.constants';
import { NextFunction, Request, Response } from 'express';
import { normalizeText } from '../../common/common.utils';
import { getValidInvite } from '../../invites/invites.service';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '../../users/users.constants';
import { getUserCount, isFirstUser } from '../../users/users.service';
import { SignUpDto } from '../auth.service';

export const validateSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, name, password, inviteToken } = req.body as SignUpDto;

  if (!VALID_EMAIL_REGEX.test(email)) {
    res.status(422).send('Invalid email address');
    return;
  }
  if (email.length > EMAIL_MAX_LENGTH) {
    res.status(422).send('Email address cannot exceed 254 characters');
    return;
  }
  if (name && !VALID_NAME_REGEX.test(name)) {
    res
      .status(422)
      .send('Username can only contain letters, numbers, and underscores');
    return;
  }
  if (name && name.length < MIN_NAME_LENGTH) {
    res.status(422).send('Username must be at least 2 characters');
    return;
  }
  if (name && name.length > MAX_NAME_LENGTH) {
    res.status(422).send('Username cannot exceed 15 characters');
    return;
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    const message = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
    res.status(422).send(message);
    return;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    const message = `Password must be at most ${MAX_PASSWORD_LENGTH} characters long`;
    res.status(422).send(message);
    return;
  }

  const isFirst = await isFirstUser();
  if (!isFirst && !inviteToken) {
    res.status(403).send('You need an invite to sign up');
    return;
  }
  if (inviteToken) {
    try {
      await getValidInvite(inviteToken);
    } catch (error) {
      res.status(403).send('Invalid invite token');
      return;
    }
  }

  const usersWithEmailCount = await getUserCount({
    where: { email: normalizeText(email) },
  });
  if (usersWithEmailCount > 0) {
    res.status(409).send('Email address is already in use');
    return;
  }

  next();
};
