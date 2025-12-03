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
  getServerById,
  getServerBySlug,
  getServers,
  updateServer,
} from '../servers.controller';
import { serverMembersRouter } from './server-members.router';

export const serversRouter = express.Router();

// Child routes
serversRouter
  .use('/:serverId/channels', channelsRouter)
  .use('/:serverId/configs', serverConfigsRouter)
  .use('/:serverId/roles', serverRolesRouter)
  .use('/:serverId/invites', serverInvitesRouter)
  .use('/:serverId/members', serverMembersRouter);

// Public routes
serversRouter.get('/default', getDefaultServer);

// Protected routes
serversRouter
  .use(authenticate)
  .get('/', getServers)
  .get('/slug/:slug', setServerMemberActivity, getServerBySlug)
  .get('/:serverId', setServerMemberActivity, getServerById)
  .post('/', createServer)
  .put('/:serverId', updateServer)
  .delete('/:serverId', deleteServer);
