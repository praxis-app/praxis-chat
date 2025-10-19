import { ImageRes } from './image.types';
import { UserRes } from './user.types';

export interface MessageRes {
  id: string;
  body: string;
  images?: ImageRes[];
  user: UserRes | null;
  userId: string | null;
  isBot: boolean;
  createdAt: string;
}

export interface MessagesQuery {
  pages: { messages: MessageRes[] }[];
  pageParams: number[];
}
