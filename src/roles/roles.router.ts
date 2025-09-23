import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { can } from './middleware/can.middleware';
import { roleMembersRouter } from './role-members.router';
import { rolePermissionsRouter } from './role-permissions.router';
import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  updateRole,
} from './roles.controller';

export const rolesRouter = express.Router();

rolesRouter.use(authenticate);

rolesRouter
  // All authenticated users can read roles
  .get('/:roleId', getRole)
  .get('/', getRoles)
  // Only users with permission can make direct changes
  .post('/', can('create', 'Role'), createRole)
  .put('/:roleId', can('update', 'Role'), updateRole)
  .delete('/:roleId', can('delete', 'Role'), deleteRole);

rolesRouter
  .use('/:roleId/permissions', rolePermissionsRouter)
  .use('/:roleId/members', roleMembersRouter);
