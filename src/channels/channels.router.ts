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
  getJoinedChannels,
  getPublicChannels,
  updateChannel,
} from './channels.controller';
import { hasChannelAccess } from './middleware/has-channel-access';
import { validateChannel } from './middleware/validate-channel.middleware';

export const channelsRouter = express.Router({
  mergeParams: true,
});

// Public routes
channelsRouter
  .get('/public', getPublicChannels)
  .get('/:channelId', hasChannelAccess, getChannel)
  .get('/:channelId/feed', hasChannelAccess, getChannelFeed)
  .use('/:channelId/messages', messagesRouter)
  .use('/:channelId/polls', pollsRouter);

// Protected routes
channelsRouter
  .use(authenticate, setServerMemberActivity, synchronizePolls)
  .get('/joined', getJoinedChannels)
  .post('/', can('create', 'Channel'), validateChannel, createChannel)
  .put('/:channelId', can('update', 'Channel'), validateChannel, updateChannel)
  .delete('/:channelId', can('delete', 'Channel'), deleteChannel);
