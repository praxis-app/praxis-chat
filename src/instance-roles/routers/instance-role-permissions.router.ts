import express from 'express';
import { can } from '../../common/roles/can.middleware';
import { updateInstanceRolePermissions } from '../instance-roles.controller';

export const instanceRolePermissionsRouter = express.Router({
  mergeParams: true,
});

instanceRolePermissionsRouter.put(
  '/',
  can('update', 'InstanceRole', 'instance'),
  updateInstanceRolePermissions,
);
