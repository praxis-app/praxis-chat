import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import {
  createVote,
  deleteVote,
  getVotersByPollOption,
  updateVote,
} from './votes.controller';
import { validateVote } from './middleware/validate-vote.middleware';

export const votesRouter = express.Router({
  mergeParams: true,
});

// TODO: Determine whether poll options should be nested under votes or polls

// Queries
votesRouter.get(
  '/poll-options/:pollOptionId/voters',
  authenticate,
  getVotersByPollOption,
);

// Mutations
votesRouter
  .use(authenticate, validateVote)
  .post('/', createVote)
  .put('/:voteId', updateVote)
  .delete('/:voteId', deleteVote);
