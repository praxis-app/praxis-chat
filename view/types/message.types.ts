import { ImageRes } from './image.types';
import { UserRes } from './user.types';

export interface MessageRes {
  id: string;
  body: string;
  images?: ImageRes[];
  user: UserRes;
  createdAt: string;
}

export interface MessagesQuery {
  pages: { messages: MessageRes[] }[];
  pageParams: number[];
}
