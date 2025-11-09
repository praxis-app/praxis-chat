import express from 'express';
import { authRouter } from '../auth/auth.router';
import { channelsRouter } from '../channels/channels.router';
import { healthRouter } from '../health/health.router';
import { invitesRouter } from '../invites/invites.router';
import { serverConfigsRouter } from '../server-configs/server-configs.router';
import { serverRolesRouter } from '../server-roles/server-roles.router';
import { serversRouter } from '../servers/servers.router';
import { usersRouter } from '../users/users.router';

export const appRouter = express.Router();

// Register routers
appRouter
  .use('/auth', authRouter)
  .use('/users', usersRouter)
  .use('/channels', channelsRouter)
  .use('/invites', invitesRouter)
  .use('/servers', serversRouter)
  .use('/server-roles', serverRolesRouter)
  .use('/server-configs', serverConfigsRouter)
  .use('/health', healthRouter);
