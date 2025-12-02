import express from 'express';
import { authRouter } from '../auth/auth.router';
import { healthRouter } from '../health/health.router';
import { instanceRolesRouter } from '../instance-roles/routers/instance-roles.router';
import { instanceRouter } from '../instance/instance.router';
import { invitesRouter } from '../invites/invites.router';
import { serversRouter } from '../servers/routers/servers.router';
import { usersRouter } from '../users/users.router';

export const appRouter = express.Router();

appRouter
  .use('/auth', authRouter)
  .use('/users', usersRouter)
  .use('/instance', instanceRouter)
  .use('/servers', serversRouter)

  // TODO: Move under instance router
  .use('/instance-roles', instanceRolesRouter)

  .use('/invites', invitesRouter)
  .use('/health', healthRouter);
