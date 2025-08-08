import { Image } from './image.types';
import { Proposal } from './proposal.types';

export interface Message {
  id: string;
  body: string;
  images?: Image[];
  user: { id: string; name: string };
  createdAt: string;
}

export interface MessagesQuery {
  pages: { messages: Message[] }[];
  pageParams: number[];
}

export type FeedItem =
  | { type: 'message'; message: Message; createdAt: string }
  | { type: 'proposal'; proposal: Proposal; createdAt: string };

export interface FeedQuery {
  pages: { feed: FeedItem[] }[];
  pageParams: number[];
}
