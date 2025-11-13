import express from 'express';
import { authRouter } from '../auth/auth.router';
import { healthRouter } from '../health/health.router';
import { instanceRolesRouter } from '../instance-roles/instance-roles.router';
import { serversRouter } from '../servers/servers.router';
import { usersRouter } from '../users/users.router';

export const appRouter = express.Router();

appRouter
  .use('/auth', authRouter)
  .use('/users', usersRouter)
  .use('/servers', serversRouter)
  .use('/instance-roles', instanceRolesRouter)
  .use('/health', healthRouter);
