import { Message } from './message.types';
import { Proposal } from './proposal.types';

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

export type FeedItem =
  | (Message & { type: 'message' })
  | (Proposal & { type: 'proposal' });

export interface FeedQuery {
  pages: { feed: FeedItem[] }[];
  pageParams: number[];
}
