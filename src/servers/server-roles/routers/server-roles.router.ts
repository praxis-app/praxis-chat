import express from 'express';
import { authenticate } from '../../../auth/middleware/authenticate.middleware';
import { can } from '../../../common/roles/can.middleware';
import { serverRoleMembersRouter } from './server-role-members.router';
import { serverRolePermissionsRouter } from './server-role-permissions.router';
import {
  createServerRole,
  deleteServerRole,
  getServerRole,
  getServerRoles,
  updateServerRole,
} from '../server-roles.controller';

export const serverRolesRouter = express.Router({
  mergeParams: true,
});

serverRolesRouter
  .use(authenticate)

  // All authenticated users can read server roles
  .get('/:serverRoleId', getServerRole)
  .get('/', getServerRoles)

  // Only users with permission can make direct changes
  .post('/', can('create', 'ServerRole'), createServerRole)
  .put('/:serverRoleId', can('update', 'ServerRole'), updateServerRole)
  .delete('/:serverRoleId', can('delete', 'ServerRole'), deleteServerRole);

serverRolesRouter
  .use('/:serverRoleId/permissions', serverRolePermissionsRouter)
  .use('/:serverRoleId/members', serverRoleMembersRouter);
