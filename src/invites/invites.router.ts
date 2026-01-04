import express from 'express';
import {
  createInvite,
  deleteInvite,
  getInvites,
  isValidInvite,
} from './invites.controller';
import { can } from '../common/roles/can.middleware';
import { authenticate } from '../auth/middleware/authenticate.middleware';

export const invitesRouter = express.Router();

invitesRouter.get('/validate/:token', isValidInvite);

export const serverInvitesRouter = express.Router({
  mergeParams: true,
});

serverInvitesRouter
  .use(authenticate)
  .get('/', can('read', 'Invite'), getInvites)
  .post('/', can('create', 'Invite'), createInvite)
  .delete('/:inviteId', can('delete', 'Invite'), deleteInvite);
