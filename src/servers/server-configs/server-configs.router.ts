import express from 'express';
import { authenticate } from '../../auth/middleware/authenticate.middleware';
import { can } from '../../common/roles/can.middleware';
import { validateServerConfig } from './middleware/validate-server-config.middleware';
import * as serverConfigsController from './server-configs.controller';

export const serverConfigsRouter = express.Router({
  mergeParams: true,
});

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
