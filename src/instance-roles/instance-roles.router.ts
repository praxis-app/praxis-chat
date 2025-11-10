import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { can } from '../common/roles/can.middleware';
import { instanceRoleMembersRouter } from './instance-role-members.router';
import { instanceRolePermissionsRouter } from './instance-role-permissions.router';
import {
  createInstanceRole,
  deleteInstanceRole,
  getInstanceRole,
  getInstanceRoles,
  updateInstanceRole,
} from './instance-roles.controller';

export const instanceRolesRouter = express.Router();

instanceRolesRouter.use(authenticate);

instanceRolesRouter
  .get('/:instanceRoleId', can('read', 'InstanceRole'), getInstanceRole)
  .get('/', can('read', 'InstanceRole'), getInstanceRoles)
  .post('/', can('create', 'InstanceRole'), createInstanceRole)
  .put('/:instanceRoleId', can('update', 'InstanceRole'), updateInstanceRole)
  .delete(
    '/:instanceRoleId',
    can('delete', 'InstanceRole'),
    deleteInstanceRole,
  );

instanceRolesRouter
  .use('/:instanceRoleId/permissions', instanceRolePermissionsRouter)
  .use('/:instanceRoleId/members', instanceRoleMembersRouter);
