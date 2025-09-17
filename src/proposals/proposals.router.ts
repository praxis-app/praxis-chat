// TODO: Guard routes with permission checks

import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { votesRouter } from '../votes/votes.router';
import { synchronizeProposals } from './middleware/synchronize-proposals.interceptor';
import { createProposal } from './proposals.controller';

export const proposalsRouter = express.Router({
  mergeParams: true,
});

proposalsRouter
  .use(authenticate, synchronizeProposals)
  .post('/', createProposal)
  .use('/:proposalId/votes', votesRouter);
