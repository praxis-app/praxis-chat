import express from 'express';
import { authenticate } from '../../auth/middleware/authenticate.middleware';
import { channelsRouter } from '../../channels/channels.router';
import { can } from '../../common/roles/can.middleware';
import { serverInvitesRouter } from '../../invites/invites.router';
import { serverConfigsRouter } from '../../server-configs/server-configs.router';
import { serverRolesRouter } from '../../server-roles/routers/server-roles.router';
import { setServerMemberActivity } from '../middleware/set-server-member-activity.middleware';
import { validateServer } from '../middleware/validate-server.middleware';
import {
  createServer,
  deleteServer,
  getDefaultServer,
  getServerById,
  getServerByInviteToken,
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
serversRouter
  .get('/default', getDefaultServer)
  .get('/invite/:inviteToken', getServerByInviteToken);

// Protected routes
serversRouter
  .use(authenticate)
  .get('/', can('read', 'Server', 'instance'), getServers)
  .get('/slug/:slug', setServerMemberActivity, getServerBySlug)
  .get(
    '/:serverId',
    can('read', 'Server', 'instance'),
    setServerMemberActivity,
    getServerById,
  )
  .post('/', can('create', 'Server', 'instance'), validateServer, createServer)
  .put(
    '/:serverId',
    can('update', 'Server', 'instance'),
    validateServer,
    updateServer,
  )
  .delete('/:serverId', can('delete', 'Server', 'instance'), deleteServer);
