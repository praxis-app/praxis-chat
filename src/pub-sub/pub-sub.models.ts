import { WebSocket, WebSocketServer } from 'ws';

export interface PubSubRequest<T = unknown> {
  type: 'REQUEST';
  request: 'PUBLISH' | 'SUBSCRIBE' | 'UNSUBSCRIBE';
  channel: string;
  token: string;
  body?: T;
}

export interface PubSubResponse<T = unknown> {
  type: 'RESPONSE';
  channel: string;
  error?: {
    code: string;
    message: string;
  };
  body?: T;
}

export type PubSubMessage<T = unknown> = PubSubRequest<T> | PubSubResponse<T>;

// TODO: Convert subscribers to a map keyed by subscriber ID
export interface PubSubChannel {
  subscribers: WebSocketWithId[];
}

export class WebSocketWithId extends WebSocket {
  id!: string;
  subscribedChannels: Set<string> = new Set();
}

export class WebSocketServerWithIds extends WebSocketServer<
  typeof WebSocketWithId
> {}
