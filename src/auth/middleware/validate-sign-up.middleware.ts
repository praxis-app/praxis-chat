import { NextFunction, Request, Response } from 'express';
import { normalizeText } from '../../common/common.utils';
import { getValidInvite } from '../../invites/invites.service';
import {
  MAX_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  VALID_NAME_REGEX,
} from '../../users/users.constants';
import { getUserCount, isFirstUser } from '../../users/users.service';
import { SignUpDto } from '../auth.service';

const VALID_EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const EMAIL_MAX_LENGTH = 254;

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
    res.status(422).send('User names cannot contain special characters');
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
