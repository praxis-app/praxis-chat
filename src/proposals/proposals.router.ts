// TODO: Guard routes with permission checks

import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { votesRouter } from '../votes/votes.router';
import { validateProposal } from './middleware/validate-proposal.middleware';
import { createProposal } from './proposals.controller';

export const proposalsRouter = express.Router({
  mergeParams: true,
});

proposalsRouter
  .use(authenticate)
  .post('/', validateProposal, createProposal)
  .use('/:proposalId/votes', votesRouter);
