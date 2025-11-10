import express from 'express';
import { can } from '../common/roles/can.middleware';
import {
  addServerRoleMembers,
  getUsersEligibleForServerRole,
  removeServerRoleMember,
} from './server-roles.controller';

export const serverRoleMembersRouter = express.Router({
  mergeParams: true,
});

serverRoleMembersRouter
  // All authenticated users can see who's eligible
  .get('/eligible', getUsersEligibleForServerRole)
  // Only users with permission can add or remove members directly
  .post('/', can('update', 'ServerRole'), addServerRoleMembers)
  .delete('/:userId', can('update', 'ServerRole'), removeServerRoleMember);
