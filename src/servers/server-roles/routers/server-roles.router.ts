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
import { canReadServerRole } from '../middleware/can-read-server-role.middleware';
import { authenticateOptional } from '../../../auth/middleware/authenticate-optional.middleware';

export const serverRolesRouter = express.Router({
  mergeParams: true,
});

serverRolesRouter.get(
  '/:serverRoleId',
  authenticateOptional,
  canReadServerRole,
  getServerRole,
);

serverRolesRouter
  .use(authenticate)

  // All authed users can read server roles
  .get('/', getServerRoles)

  // Only users with permission can make direct changes
  .post('/', can('create', 'ServerRole'), createServerRole)
  .put('/:serverRoleId', can('update', 'ServerRole'), updateServerRole)
  .delete('/:serverRoleId', can('delete', 'ServerRole'), deleteServerRole);

serverRolesRouter
  .use('/:serverRoleId/permissions', serverRolePermissionsRouter)
  .use('/:serverRoleId/members', serverRoleMembersRouter);
