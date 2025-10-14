import { MessageRes } from './message.types';
import { PollRes } from './poll.types';

export interface ChannelRes {
  id: string;
  name: string;
  description: string | null;
}

export interface CreateChannelReq {
  name: string;
  description?: string;
}

export interface UpdateChannelReq {
  name: string;
  description?: string;
}

export type FeedItemRes =
  | (MessageRes & { type: 'message' })
  | (PollRes & { type: 'poll' });

export interface FeedQuery {
  pages: { feed: FeedItemRes[] }[];
  pageParams: number[];
}
