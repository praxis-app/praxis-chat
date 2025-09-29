import { ImageRes, ProfilePicture } from './image.types';
import { Permission } from './role.types';

export interface CurrentUserRes {
  id: string;
  name: string;
  displayName?: string;
  bio?: string;
  anonymous: boolean;
  permissions: Permission[];
  profilePicture: ImageRes | null;
}

export interface UserRes {
  id: string;
  name: string;
  displayName?: string;
}

export interface UpdateUserProfileReq {
  name?: string;
  displayName?: string;
  bio?: string;
}

export interface CurrentUser extends CurrentUserRes {
  profilePicture: ProfilePicture | null;
}
