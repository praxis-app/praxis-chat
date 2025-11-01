import express from 'express';
import { authRouter } from '../auth/auth.router';
import { channelsRouter } from '../channels/channels.router';
import { healthRouter } from '../health/health.router';
import { invitesRouter } from '../invites/invites.router';
import { serverRolesRouter } from '../server-roles/server-roles.router';
import { serverConfigsRouter } from '../server-configs/server-configs.router';
import { usersRouter } from '../users/users.router';

export const appRouter = express.Router();

// Register routers
appRouter.use('/auth', authRouter);
appRouter.use('/users', usersRouter);
appRouter.use('/channels', channelsRouter);
appRouter.use('/invites', invitesRouter);
appRouter.use('/server-roles', serverRolesRouter);
appRouter.use('/server-configs', serverConfigsRouter);
appRouter.use('/health', healthRouter);
