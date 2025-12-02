import express from 'express';
import { authenticate } from '../../auth/middleware/authenticate.middleware';
import { can } from '../../common/roles/can.middleware';
import {
  addServerMembers,
  getUsersEligibleForServer,
  removeServerMembers,
} from '../servers.controller';

export const serverMembersRouter = express.Router({
  mergeParams: true,
});

serverMembersRouter
  .use(authenticate)
  .get('/eligible', can('read', 'Server'), getUsersEligibleForServer)
  .post('/', can('update', 'Server'), addServerMembers)
  .delete('/:userId', can('update', 'Server'), removeServerMembers);
