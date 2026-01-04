import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  VALID_NAME_REGEX,
} from '@common/users/user.constants';
import { NextFunction, Request, Response } from 'express';
import * as zod from 'zod';
import { normalizeText } from '../../common/text.utils';
import { isValidInvite } from '../../invites/invites.service';
import { getUserCount, isFirstUser } from '../../users/users.service';
import { SignUpDto } from '../auth.service';

// TODO: Move to @common, return error message keys similar to `ServerConfigErrorKeys`
const signUpSchema = zod
  .object({
    name: zod
      .string()
      .min(NAME_MIN_LENGTH, {
        message: `Username must be at least ${NAME_MIN_LENGTH} characters`,
      })
      .max(NAME_MAX_LENGTH, {
        message: `Username cannot exceed ${NAME_MAX_LENGTH} characters`,
      })
      .regex(VALID_NAME_REGEX, {
        message: 'Username can only contain letters, numbers, and underscores',
      }),
    email: zod
      .email({
        message: 'Invalid email address',
      })
      .max(EMAIL_MAX_LENGTH, {
        message: `Email address cannot exceed ${EMAIL_MAX_LENGTH} characters`,
      }),
    password: zod
      .string()
      .min(PASSWORD_MIN_LENGTH, {
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
      })
      .max(PASSWORD_MAX_LENGTH, {
        message: `Password must be at most ${PASSWORD_MAX_LENGTH} characters long`,
      }),
    confirmPassword: zod
      .string()
      .min(PASSWORD_MIN_LENGTH, {
        message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
      })
      .max(PASSWORD_MAX_LENGTH, {
        message: `Password must be at most ${PASSWORD_MAX_LENGTH} characters long`,
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const validateSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const body = req.body as SignUpDto;

    // Validate request body shape
    signUpSchema.parse(body);

    const { email, inviteToken } = body;
    const isAnon = res.locals.user?.anonymous === true;

    // Validate invite token
    const isFirst = await isFirstUser();
    if (!isFirst && !inviteToken && !isAnon) {
      res.status(403).send('You need an invite to sign up');
      return;
    }
    if (inviteToken) {
      const isValid = await isValidInvite({
        token: inviteToken,
      });
      if (!isValid) {
        res.status(403).send('Invalid invite token');
        return;
      }
    }

    // Check if email is already in use
    const usersWithEmailCount = await getUserCount({
      where: { email: normalizeText(email) },
    });
    if (usersWithEmailCount > 0) {
      res.status(409).send('Email address is already in use');
      return;
    }

    next();
  } catch (error) {
    if (error instanceof zod.ZodError) {
      const errorMessage =
        error.issues[0]?.message || 'Validation failed for sign up';
      res.status(422).send(errorMessage);
      return;
    }
    res.status(500).send('Internal server error');
  }
};
