import { MessageRes } from './message.types';
import { ProposalRes } from './proposal.types';

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
  | (ProposalRes & { type: 'proposal' });

export interface FeedQuery {
  pages: { feed: FeedItemRes[] }[];
  pageParams: number[];
}
