import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { can } from '../common/roles/can.middleware';
import { instanceRolesRouter } from './instance-roles/routers/instance-roles.router';
import { getInstanceConfig, updateInstanceConfig } from './instance.controller';

export const instanceRouter = express.Router();

instanceRouter
  .use(authenticate)
  .get('/config', can('read', 'InstanceConfig', 'instance'), getInstanceConfig)
  .put(
    '/config',
    can('update', 'InstanceConfig', 'instance'),
    updateInstanceConfig,
  )
  .use('/roles', instanceRolesRouter);
