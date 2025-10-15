import express from 'express';
import { authenticateOptional } from '../auth/middleware/authenticate-optional.middleware';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { isChannelMember } from '../channels/middleware/is-channel-member.middleware';
import { uploadImage } from '../images/middleware/upload-image.middleware';
import { verifyImage } from '../images/middleware/verify-image.middleware';
import {
  createMessage,
  getMessageImage,
  uploadMessageImage,
} from './messages.controller';
import { canReadMessageImage } from './middleware/can-read-message-image.middleware';
import { validateMessage } from './middleware/validate-message.middleware';

const IMAGE_ROUTE = '/:messageId/images/:imageId';

export const messagesRouter = express.Router({
  mergeParams: true,
});

// Public routes
messagesRouter.get(
  IMAGE_ROUTE,
  authenticateOptional,
  canReadMessageImage,
  verifyImage,
  getMessageImage,
);

// Protected routes
messagesRouter
  .use(authenticate, isChannelMember)
  .post('/', validateMessage, createMessage)
  .post(`${IMAGE_ROUTE}/upload`, uploadImage, uploadMessageImage);
