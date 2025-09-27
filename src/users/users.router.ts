import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { validateUserProfile } from './middleware/validate-user-profile.middleware';
import {
  getCurrentUser,
  isFirstUser,
  updateUserProfile,
} from './users.controller';

export const usersRouter = express.Router();

// Public routes
usersRouter.get('/is-first', isFirstUser);

// Protected routes
usersRouter
  .use(authenticate)
  .get('/me', getCurrentUser)
  .put('/profile', validateUserProfile, updateUserProfile);
