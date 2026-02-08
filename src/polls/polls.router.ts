import express from 'express';
import { authenticateOptional } from '../auth/middleware/authenticate-optional.middleware';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { canReadPollImage } from '../channels/middleware/can-read-poll-image.middleware';
import { isChannelMember } from '../channels/middleware/is-channel-member.middleware';
import { uploadImage } from '../images/middleware/upload-image.middleware';
import { verifyImage } from '../images/middleware/verify-image.middleware';
import { votesRouter } from '../votes/votes.router';
import { validatePoll } from './middleware/validate-poll.middleware';
import { getVotersByPollOption } from '../votes/votes.controller';
import { createPoll, getPollImage, uploadPollImage } from './polls.controller';

const IMAGE_ROUTE = '/:pollId/images/:imageId';

export const pollsRouter = express.Router({
  mergeParams: true,
});

// Public routes
pollsRouter.get(
  IMAGE_ROUTE,
  authenticateOptional,
  canReadPollImage,
  verifyImage,
  getPollImage,
);

// Protected routes
pollsRouter
  .use(authenticate, isChannelMember)
  .get('/:pollId/options/:pollOptionId/voters', getVotersByPollOption)
  .post('/', validatePoll, createPoll)
  .post(`${IMAGE_ROUTE}/upload`, uploadImage, uploadPollImage)
  .use('/:pollId/votes', votesRouter);
