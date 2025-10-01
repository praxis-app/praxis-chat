import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { uploadImage } from '../images/middleware/upload-image.middleware';
import { validateUserProfile } from './middleware/validate-user-profile.middleware';
import {
  createUserCoverPhoto,
  createUserProfilePicture,
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
  .post('/profile-picture', uploadImage, createUserProfilePicture)
  .post('/cover-photo', uploadImage, createUserCoverPhoto)
  .put('/profile', validateUserProfile, updateUserProfile);
