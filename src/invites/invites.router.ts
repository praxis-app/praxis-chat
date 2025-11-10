import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import {
  createInvite,
  deleteInvite,
  getInvite,
  getInvites,
} from './invites.controller';
import { can } from '../common/roles/can.middleware';

export const invitesRouter = express.Router();

invitesRouter.get('/:token', getInvite);

invitesRouter
  .use(authenticate)
  .get('/', can('read', 'Invite'), getInvites)
  .post('/', can('create', 'Invite'), createInvite)
  .delete('/:inviteId', can('delete', 'Invite'), deleteInvite);
