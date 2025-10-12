// TODO: Add channel specific permissions

import express from 'express';
import { authenticateOptional } from '../auth/middleware/authenticate-optional.middleware';
import { authenticate } from '../auth/middleware/authenticate.middleware';
import { isRegistered } from '../auth/middleware/is-registered.middleware';
import { messagesRouter } from '../messages/messages.router';
import { synchronizePolls } from '../polls/middleware/synchronize-polls.middleware';
import { pollsRouter } from '../polls/polls.router';
import { can } from '../roles/middleware/can.middleware';
import {
  createChannel,
  deleteChannel,
  getChannel,
  getChannelFeed,
  getChannels,
  getGeneralChannel,
  getGeneralChannelFeed,
  getJoinedChannels,
  updateChannel,
} from './channels.controller';
import { isChannelMember } from './middleware/is-channel-member.middleware';
import { validateChannel } from './middleware/validate-channel.middleware';

export const channelsRouter = express.Router();

// Public routes
channelsRouter
  .get('/general', getGeneralChannel)
  .get('/general/feed', authenticateOptional, getGeneralChannelFeed);

// Protected routes
channelsRouter
  .use(authenticate, synchronizePolls)
  .get('/', isRegistered, getChannels)
  .get('/joined', isRegistered, getJoinedChannels)
  .get('/:channelId', isRegistered, isChannelMember, getChannel)
  .post('/', can('create', 'Channel'), validateChannel, createChannel)
  .put('/:channelId', can('update', 'Channel'), validateChannel, updateChannel)
  .delete('/:channelId', can('delete', 'Channel'), deleteChannel)
  .get('/:channelId/feed', isChannelMember, getChannelFeed)
  .use('/:channelId/polls', isChannelMember, pollsRouter)
  .use('/:channelId/messages', isChannelMember, messagesRouter);
