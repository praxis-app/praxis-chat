import express from 'express';
import { can } from '../../../common/roles/can.middleware';
import {
  createInstanceRole,
  deleteInstanceRole,
  getInstanceRole,
  getInstanceRoles,
  updateInstanceRole,
} from '../instance-roles.controller';
import { instanceRoleMembersRouter } from './instance-role-members.router';
import { instanceRolePermissionsRouter } from './instance-role-permissions.router';

export const instanceRolesRouter = express.Router();

instanceRolesRouter
  .get(
    '/:instanceRoleId',
    can('read', 'InstanceRole', 'instance'),
    getInstanceRole,
  )
  .get('/', can('read', 'InstanceRole', 'instance'), getInstanceRoles)
  .post('/', can('create', 'InstanceRole', 'instance'), createInstanceRole)
  .put(
    '/:instanceRoleId',
    can('update', 'InstanceRole', 'instance'),
    updateInstanceRole,
  )
  .delete(
    '/:instanceRoleId',
    can('delete', 'InstanceRole', 'instance'),
    deleteInstanceRole,
  );

instanceRolesRouter
  .use('/:instanceRoleId/permissions', instanceRolePermissionsRouter)
  .use('/:instanceRoleId/members', instanceRoleMembersRouter);
