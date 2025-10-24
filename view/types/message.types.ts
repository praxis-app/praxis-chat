import { ImageRes } from './image.types';
import { UserRes } from './user.types';

export interface BotRes {
  id: string;
  name: string;
  displayName: string | null;
}

export interface MessageRes {
  id: string;
  body: string | null;
  images?: ImageRes[];
  user: UserRes | null;
  userId: string | null;
  botId: string | null;
  bot: BotRes | null;
  commandStatus?: 'processing' | 'completed' | 'failed' | null;
  createdAt: string;
}

export interface MessagesQuery {
  pages: { messages: MessageRes[] }[];
  pageParams: number[];
}
