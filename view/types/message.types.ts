import { ImageRes } from './image.types';

export interface MessageRes {
  id: string;
  body: string;
  images?: ImageRes[];
  user: {
    id: string;
    name: string;
    displayName?: string;
    profilePictureId?: string;
    coverPhotoId?: string;
  };
  createdAt: string;
}

export interface MessagesQuery {
  pages: { messages: MessageRes[] }[];
  pageParams: number[];
}
