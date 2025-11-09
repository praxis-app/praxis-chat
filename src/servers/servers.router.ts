import { authenticate } from '../auth/middleware/authenticate.middleware';
import { getServers, getServerBySlug } from './servers.controller';
import express from 'express';

export const serversRouter = express.Router();

serversRouter
  .use(authenticate)
  .get('/', getServers)
  .get('/:slug', getServerBySlug);
