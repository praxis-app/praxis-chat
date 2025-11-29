import { ImageRes } from './image.types';
import { Permission } from './server-role.types';
import { ServerRes } from './server.types';

export interface UserRes {
  id: string;
  name: string;
  displayName?: string;
  profilePicture: ImageRes | null;
}

export interface CurrentUserRes {
  id: string;
  name: string;
  displayName?: string;
  anonymous: boolean;
  permissions: {
    instance: Permission[];
    servers: Record<string, Permission[]>;
  };
  profilePicture: ImageRes | null;
  currentServer: ServerRes | null;
}

export interface UserProfileRes {
  id: string;
  name: string;
  displayName?: string;
  bio?: string;
  profilePicture: ImageRes | null;
  coverPhoto: ImageRes | null;
}

export interface UpdateUserProfileReq {
  name?: string;
  displayName?: string;
  bio?: string;
}

export interface CurrentUser extends CurrentUserRes {
  profilePicture: (ImageRes & { url: string }) | null;
}
