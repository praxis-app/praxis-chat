// TODO: Guard routes with permission checks

import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { createVote, deleteVote, updateVote } from './votes.controller';

export const votesRouter = express.Router({ mergeParams: true });

votesRouter
  .use(authenticate)
  .post('/', createVote)
  .put('/:voteId', updateVote)
  .delete('/:voteId', deleteVote);
