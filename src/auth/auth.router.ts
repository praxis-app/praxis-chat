import express from 'express';
import {
  createAnonSession,
  login,
  logOut,
  signUp,
  upgradeAnonSession,
} from './auth.controller';
import { authenticate } from './middleware/authenticate.middleware';
import { loginRateLimiter } from './middleware/login-rate-limiter.middleware';
import { validateCreateAnon } from './middleware/validate-create-anon.middleware';
import { validateSignUp } from './middleware/validate-sign-up.middleware';

export const authRouter = express.Router();

authRouter
  .post('/signup', validateSignUp, signUp)
  .post('/login', loginRateLimiter, login)
  .delete('/logout', logOut);

authRouter
  .post('/anon', validateCreateAnon, createAnonSession)
  .put('/anon', authenticate, validateSignUp, upgradeAnonSession);
