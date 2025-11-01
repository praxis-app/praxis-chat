import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { can } from '../server-roles/middleware/can.middleware';
import { validateServerConfig } from './middleware/validate-server-config.middleware';
import * as serverConfigsController from './server-configs.controller';

export const serverConfigsRouter = express.Router();

serverConfigsRouter
  .use(authenticate)
  .get(
    '/',
    can('read', 'ServerConfig'),
    serverConfigsController.getServerConfig,
  )
  .put(
    '/',
    can('update', 'ServerConfig'),
    validateServerConfig,
    serverConfigsController.updateServerConfig,
  );
