import WebSocket from 'ws';
import * as authService from '../auth/auth.service';
import * as cacheService from '../cache/cache.service';
import * as rolesService from '../roles/roles.service';
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

  const canAccess = rolesService.canAccessChannel(channel, user);
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
  subscriber.id = token;

  // Add subscriber to Redis set and local map
  const channelKey = getChannelCacheKey(channel);
  await cacheService.addSetMember(channelKey, token);
  subscribers[token] = subscriber;

  // Clean up on disconnect
  subscriber.on('close', async () => {
    await unsubscribe(channel, token);
    delete subscribers[token];
  });
};

const unsubscribe = async (channel: string, token: string) => {
  const channelKey = getChannelCacheKey(channel);
  await cacheService.removeSetMember(channelKey, token);
  delete subscribers[token];
};

const getChannelCacheKey = (channel: string) => {
  return `channel:${channel}`;
};
