import express from 'express';
import { can } from './middleware/can.middleware';
import {
  addRoleMembers,
  getUsersEligibleForRole,
  removeRoleMember,
} from './roles.controller';

export const roleMembersRouter = express.Router({
  mergeParams: true,
});

roleMembersRouter
  // All authenticated users can see who's eligible
  .get('/eligible', getUsersEligibleForRole)
  // Only users with permission can add or remove members directly
  .post('/', can('update', 'Role'), addRoleMembers)
  .delete('/:userId', can('update', 'Role'), removeRoleMember);
