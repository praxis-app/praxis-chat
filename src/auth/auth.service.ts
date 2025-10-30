import { compare, hash } from 'bcrypt';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { normalizeText } from '../common/common.utils';
import { dataSource } from '../database/data-source';
import * as invitesService from '../invites/invites.service';
import { User } from '../users/user.entity';
import * as usersService from '../users/users.service';

dotenv.config();

const ACCESS_TOKEN_EXPIRES_IN = 60 * 60 * 24 * 90;
const SALT_ROUNDS = 10;

export interface SignUpDto {
  email: string;
  name?: string;
  password: string;
  inviteToken?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

const userRepository = dataSource.getRepository(User);

// TODO: Move validation to middleware with zod
export const login = async ({ email, password }: LoginDto) => {
  if (!email) {
    throw new Error('Email is required');
  }
  if (!password) {
    throw new Error('Password is required');
  }

  const normalizedEmail = normalizeText(email);
  const user = await userRepository.findOne({
    where: { email: normalizedEmail },
  });
  if (!user || user.locked) {
    throw new Error('Incorrect username or password');
  }

  const passwordMatch = await compare(password, user.password!);
  if (!passwordMatch) {
    throw new Error('Incorrect username or password');
  }

  return generateAccessToken(user.id);
};

export const signUp = async ({
  email,
  name,
  password,
  inviteToken,
}: SignUpDto) => {
  const passwordHash = await hash(password, SALT_ROUNDS);
  const user = await usersService.createUser(email, name, passwordHash);

  if (inviteToken) {
    await invitesService.redeemInvite(inviteToken);
  }
  return generateAccessToken(user.id);
};

export const upgradeAnonSession = async (
  { name, email, password }: SignUpDto,
  userId: string,
) => {
  const passwordHash = await hash(password, SALT_ROUNDS);
  await usersService.upgradeAnonUser(userId, email, passwordHash, name);
};

export const createAnonSession = async (inviteToken?: string) => {
  const user = await usersService.createAnonUser();

  if (inviteToken) {
    await invitesService.redeemInvite(inviteToken);
  }
  return generateAccessToken(user.id);
};

export const verifyAccessToken = (token: string) => {
  try {
    const secret = process.env.AUTH_TOKEN_SECRET as string;
    const { sub } = jwt.verify(token, secret) as { sub: string };
    return sub;
  } catch {
    return '';
  }
};

export const generateAccessToken = (userId: string) => {
  const payload = { sub: userId };
  return jwt.sign(payload, process.env.AUTH_TOKEN_SECRET || '', {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};
