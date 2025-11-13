// TODO: Add permissions middleware

import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { channelsRouter } from '../channels/channels.router';
import { invitesRouter } from '../invites/invites.router';
import { serverConfigsRouter } from '../server-configs/server-configs.router';
import { serverRolesRouter } from '../server-roles/server-roles.router';
import { setServerMemberLastActiveAt } from './middleware/set-server-member-last-active-at.middleware';
import {
  createServer,
  deleteServer,
  getServerBySlug,
  getServers,
  updateServer,
} from './servers.controller';

export const serversRouter = express.Router();

serversRouter
  .use(authenticate, setServerMemberLastActiveAt)
  .get('/', getServers)
  .get('/:slug', getServerBySlug)
  .post('/', createServer)
  .put('/:serverId', updateServer)
  .delete('/:serverId', deleteServer);

serversRouter
  .use('/:serverId/channels', channelsRouter)
  .use('/:serverId/configs', serverConfigsRouter)
  .use('/:serverId/roles', serverRolesRouter)
  .use('/:serverId/invites', invitesRouter);
