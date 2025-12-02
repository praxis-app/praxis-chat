import express from 'express';
import { can } from '../../common/roles/can.middleware';
import { updateServerRolePermissions } from '../server-roles.controller';

export const serverRolePermissionsRouter = express.Router({
  mergeParams: true,
});

serverRolePermissionsRouter.put(
  '/',
  can('update', 'ServerRole'),
  updateServerRolePermissions,
);
