import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { validateVote } from './middleware/validate-vote.middleware';
import { createVote, deleteVote, updateVote } from './votes.controller';

export const votesRouter = express.Router({
  mergeParams: true,
});

votesRouter
  .use(authenticate, validateVote)
  .post('/', createVote)
  .put('/:voteId', updateVote)
  .delete('/:voteId', deleteVote);
