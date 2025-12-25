// TODO: Add channel specific permissions

import express from 'express';
import { authenticateOptional } from '../auth/middleware/authenticate-optional.middleware';
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
  getGeneralChannel,
  getGeneralChannelFeed,
  getJoinedChannels,
  updateChannel,
} from './channels.controller';
import { isChannelMember } from './middleware/is-channel-member.middleware';
import { validateChannel } from './middleware/validate-channel.middleware';

export const channelsRouter = express.Router({
  mergeParams: true,
});

// Public routes
channelsRouter
  .get('/general', getGeneralChannel)
  .get('/general/feed', authenticateOptional, getGeneralChannelFeed)
  .use('/:channelId/messages', messagesRouter)
  .use('/:channelId/polls', pollsRouter);

// TODO: Decide whether to add separate middleware for
// protecting channel routes based on server membership

// Protected routes
channelsRouter
  .use(authenticate, setServerMemberActivity, synchronizePolls)
  .get('/joined', getJoinedChannels)
  .get('/:channelId', isChannelMember, getChannel)
  .get('/:channelId/feed', isChannelMember, getChannelFeed)
  .post('/', can('create', 'Channel'), validateChannel, createChannel)
  .put('/:channelId', can('update', 'Channel'), validateChannel, updateChannel)
  .delete('/:channelId', can('delete', 'Channel'), deleteChannel);
