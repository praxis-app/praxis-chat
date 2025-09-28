import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { uploadImage } from '../images/middleware/upload-image.middleware';
import { validateUserProfile } from './middleware/validate-user-profile.middleware';
import {
  getCurrentUser,
  getUserProfilePicture,
  isFirstUser,
  updateUserProfile,
  uploadUserProfilePicture,
} from './users.controller';

export const usersRouter = express.Router();

// Public routes
usersRouter.get('/is-first', isFirstUser);

// Protected routes
usersRouter
  .use(authenticate)
  .get('/me', getCurrentUser)
  .get('/:userId/profile-picture', getUserProfilePicture)
  .post('/profile-picture', uploadImage, uploadUserProfilePicture)
  .put('/profile', validateUserProfile, updateUserProfile);
