// TODO: Guard routes with permission checks

import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { uploadImage } from '../images/middleware/upload-image.middleware';
import {
  createMessage,
  getMessageImage,
  uploadMessageImage,
} from './messages.controller';
import { validateMessage } from './middleware/validate-message.middleware';

const IMAGE_ROUTE = '/:messageId/images/:imageId';

export const messagesRouter = express.Router({
  mergeParams: true,
});

messagesRouter
  .use(authenticate)
  .post('/', validateMessage, createMessage)
  .get(IMAGE_ROUTE, getMessageImage)
  .post(`${IMAGE_ROUTE}/upload`, uploadImage, uploadMessageImage);
