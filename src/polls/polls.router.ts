import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { uploadImage } from '../images/middleware/upload-image.middleware';
import { verifyImage } from '../images/middleware/verify-image.middleware';
import { votesRouter } from '../votes/votes.router';
import { validatePoll } from './middleware/validate-poll.middleware';
import {
  createPoll,
  getPollImage,
  uploadPollImage,
} from './polls.controller';

const IMAGE_ROUTE = '/:pollId/images/:imageId';

export const pollsRouter = express.Router({
  mergeParams: true,
});

pollsRouter
  .use(authenticate)
  .post('/', validatePoll, createPoll)
  .get(IMAGE_ROUTE, verifyImage, getPollImage)
  .post(`${IMAGE_ROUTE}/upload`, uploadImage, uploadPollImage)
  .use('/:pollId/votes', votesRouter);
