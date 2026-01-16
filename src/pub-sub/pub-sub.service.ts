import WebSocket from 'ws';
import * as authService from '../auth/auth.service';
import * as cacheService from '../cache/cache.service';
import { CHANNEL_ACCESS_MAP } from './channel-access';
import { User } from '../users/user.entity';
import * as usersService from '../users/users.service';
import {
  PubSubRequest,
  PubSubResponse,
  WebSocketWithId,
} from './pub-sub.models';

/** Local mapping of subscriber IDs to websockets */
const subscribers: Record<string, WebSocketWithId> = {};

export const handleMessage = async (
  webSocket: WebSocketWithId,
  data: WebSocket.RawData,
) => {
  const { channel, body, request, token }: PubSubRequest = JSON.parse(
    data.toString(),
  );

  const sub = authService.verifyAccessToken(token);
  const user = await usersService.getCurrentUser(sub, false);

  if (!user) {
    const response: PubSubResponse = {
      error: { code: 'UNAUTHORIZED', message: 'Invalid token' },
      type: 'RESPONSE',
      channel,
    };
    webSocket.send(JSON.stringify(response));
    return;
  }

  const canAccess = canAccessChannel(channel, user);
  if (!canAccess) {
    const response: PubSubResponse = {
      error: { code: 'FORBIDDEN', message: 'Forbidden' },
      type: 'RESPONSE',
      channel,
    };
    webSocket.send(JSON.stringify(response));
    return;
  }

  switch (request) {
    case 'PUBLISH':
      publish(channel, body, webSocket);
      break;
    case 'SUBSCRIBE':
      subscribe(channel, token, webSocket);
      break;
    case 'UNSUBSCRIBE':
      unsubscribe(channel, token);
      break;
    default:
      webSocket.send(JSON.stringify({ error: 'Invalid request type' }));
  }
};

export const publish = async (
  channel: string,
  message: unknown,
  publisher?: WebSocketWithId,
) => {
  const channelKey = getChannelCacheKey(channel);
  const subscriberIds = await cacheService.getSetMembers(channelKey);
  if (subscriberIds.length === 0) {
    return;
  }

  for (const subscriberId of subscriberIds) {
    if (subscriberId === publisher?.id) {
      continue;
    }
    const subscriber = subscribers[subscriberId];
    if (subscriber?.readyState === WebSocket.OPEN) {
      subscriber.send(
        JSON.stringify({
          channel: channel,
          body: message,
        }),
      );
    }
  }
};

const subscribe = async (
  channel: string,
  token: string,
  subscriber: WebSocketWithId,
) => {
  const isFirstSubscription = !subscriber.id;

  subscriber.id = token;

  if (!subscriber.subscribedChannels) {
    subscriber.subscribedChannels = new Set();
  }
  subscriber.subscribedChannels.add(channel);

  // Add subscriber to Redis set and local map
  const channelKey = getChannelCacheKey(channel);
  await cacheService.addSetMember(channelKey, token);
  subscribers[token] = subscriber;

  // Clean up on disconnect (only add listener once per WebSocket)
  if (isFirstSubscription) {
    subscriber.on('close', async () => {
      for (const subscribedChannel of subscriber.subscribedChannels) {
        await unsubscribe(subscribedChannel, token);
      }
      delete subscribers[token];
    });
  }
};

const unsubscribe = async (channel: string, token: string) => {
  const channelKey = getChannelCacheKey(channel);
  await cacheService.removeSetMember(channelKey, token);

  const subscriber = subscribers[token];
  if (subscriber?.subscribedChannels) {
    subscriber.subscribedChannels.delete(channel);
  }
};

/** Check if a user can access a given pub-sub channel */
const canAccessChannel = (channelKey: string, user: User) => {
  for (const { pattern, rules } of Object.values(CHANNEL_ACCESS_MAP)) {
    const match = pattern.exec(channelKey);
    if (match) {
      return Object.values(rules).every((rule) => rule(match, user));
    }
  }
  return false;
};

const getChannelCacheKey = (channel: string) => {
  return `channel:${channel}`;
};
