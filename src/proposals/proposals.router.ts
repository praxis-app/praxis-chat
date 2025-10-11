import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { uploadImage } from '../images/middleware/upload-image.middleware';
import { votesRouter } from '../votes/votes.router';
import { validateProposal } from './middleware/validate-proposal.middleware';
import {
  createProposal,
  getProposalImage,
  uploadProposalImage,
} from './proposals.controller';

const IMAGE_ROUTE = '/:proposalId/images/:imageId';

export const proposalsRouter = express.Router({
  mergeParams: true,
});

proposalsRouter
  .use(authenticate)
  .post('/', validateProposal, createProposal)
  .get(IMAGE_ROUTE, getProposalImage)
  .post(`${IMAGE_ROUTE}/upload`, uploadImage, uploadProposalImage)
  .use('/:proposalId/votes', votesRouter);
