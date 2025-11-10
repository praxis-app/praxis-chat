import express from 'express';
import { can } from '../common/roles/can.middleware';
import {
  addInstanceRoleMembers,
  getUsersEligibleForInstanceRole,
  removeInstanceRoleMember,
} from './instance-roles.controller';

export const instanceRoleMembersRouter = express.Router({
  mergeParams: true,
});

instanceRoleMembersRouter
  .get(
    '/eligible',
    can('read', 'InstanceRole'),
    getUsersEligibleForInstanceRole,
  )
  .post('/', can('update', 'InstanceRole'), addInstanceRoleMembers)
  .delete('/:userId', can('update', 'InstanceRole'), removeInstanceRoleMember);
