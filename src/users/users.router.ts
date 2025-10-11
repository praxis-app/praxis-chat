import express from 'express';
import { authenticateOptional } from '../auth/middleware/authenticate-optional.middleware';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { isRegistered } from '../auth/middleware/is-registered.middleware';
import { uploadImage } from '../images/middleware/upload-image.middleware';
import { canReadUserProfile } from './middleware/can-read-user-profile.middleware';
import { validateUserProfile } from './middleware/validate-user-profile.middleware';
import {
  createUserCoverPhoto,
  createUserProfilePicture,
  getCurrentUser,
  getUserImage,
  getUserProfile,
  isFirstUser,
  updateUserProfile,
} from './users.controller';

export const usersRouter = express.Router();

// Public routes
usersRouter
  .get('/is-first', isFirstUser)
  .get('/:userId/images/:imageId', authenticateOptional, getUserImage);

// Protected routes
usersRouter
  .use(authenticate)
  .get('/me', getCurrentUser)
  .get('/:userId/profile', canReadUserProfile, getUserProfile)
  .post('/profile-picture', isRegistered, uploadImage, createUserProfilePicture)
  .post('/cover-photo', isRegistered, uploadImage, createUserCoverPhoto)
  .put('/profile', isRegistered, validateUserProfile, updateUserProfile);
