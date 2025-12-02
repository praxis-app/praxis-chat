// TODO: Add permissions middleware

import express from 'express';
import { authenticate } from '../../auth/middleware/authenticate.middleware';
import { channelsRouter } from '../../channels/channels.router';
import { serverInvitesRouter } from '../../invites/invites.router';
import { serverConfigsRouter } from '../../server-configs/server-configs.router';
import { serverRolesRouter } from '../../server-roles/routers/server-roles.router';
import { setServerMemberActivity } from '../middleware/set-server-member-activity.middleware';
import {
  createServer,
  deleteServer,
  getDefaultServer,
  getServerBySlug,
  getServers,
  updateServer,
} from '../servers.controller';

export const serversRouter = express.Router();

// Child routes
serversRouter
  .use('/:serverId/channels', channelsRouter)
  .use('/:serverId/configs', serverConfigsRouter)
  .use('/:serverId/roles', serverRolesRouter)
  .use('/:serverId/invites', serverInvitesRouter);

// Public routes
serversRouter.get('/default', getDefaultServer);

// Protected routes
serversRouter
  .use(authenticate)
  .use(['/:slug', '/:serverId'], setServerMemberActivity)
  .get('/', getServers)
  .get('/:slug', getServerBySlug)
  .post('/', createServer)
  .put('/:serverId', updateServer)
  .delete('/:serverId', deleteServer);
