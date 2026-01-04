import express from 'express';
import { authenticate } from '../../auth/middleware/authenticate.middleware';
import { can } from '../../common/roles/can.middleware';
import {
  addServerMembers,
  getServerMembers,
  getUsersEligibleForServer,
  removeServerMembers,
} from '../servers.controller';

export const serverMembersRouter = express.Router({
  mergeParams: true,
});

serverMembersRouter
  .use(authenticate)
  .get('/', can('read', 'Server', 'instance'), getServerMembers)
  .get(
    '/eligible',
    can('read', 'Server', 'instance'),
    getUsersEligibleForServer,
  )
  .post('/', can('update', 'Server', 'instance'), addServerMembers)
  .delete('/', can('update', 'Server', 'instance'), removeServerMembers);
