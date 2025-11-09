// TODO: Add permissions middleware

import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import {
  createServer,
  getServerBySlug,
  getServers,
} from './servers.controller';

export const serversRouter = express.Router();

serversRouter
  .use(authenticate)
  .get('/', getServers)
  .get('/:slug', getServerBySlug)
  .post('/', createServer);
