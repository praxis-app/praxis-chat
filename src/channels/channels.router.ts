// TODO: Add channel specific permissions

import express from 'express';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { can } from '../common/roles/can.middleware';
import { messagesRouter } from '../messages/messages.router';
import { synchronizePolls } from '../polls/middleware/synchronize-polls.middleware';
import { pollsRouter } from '../polls/polls.router';
import { setServerMemberActivity } from '../servers/middleware/set-server-member-activity.middleware';
import {
  createChannel,
  deleteChannel,
  getChannel,
  getChannelFeed,
  getChannels,
  getJoinedChannels,
  updateChannel,
} from './channels.controller';
import { canAccessChannel } from './middleware/can-access-channel';
import { canAccessChannels } from './middleware/can-access-channels';
import { validateChannel } from './middleware/validate-channel.middleware';

export const channelsRouter = express.Router({
  mergeParams: true,
});

// Protected route - needs to be placed above parameterized routes
channelsRouter.get(
  '/joined',
  authenticate,
  setServerMemberActivity,
  synchronizePolls,
  getJoinedChannels,
);

// Public routes
channelsRouter
  .get('/', canAccessChannels, getChannels)
  .get('/:channelId', canAccessChannel, getChannel)
  .get('/:channelId/feed', canAccessChannel, getChannelFeed)
  .use('/:channelId/messages', messagesRouter)
  .use('/:channelId/polls', pollsRouter);

// Protected routes
channelsRouter
  .use(authenticate, setServerMemberActivity, synchronizePolls)
  .post('/', can('create', 'Channel'), validateChannel, createChannel)
  .put('/:channelId', can('update', 'Channel'), validateChannel, updateChannel)
  .delete('/:channelId', can('delete', 'Channel'), deleteChannel);
