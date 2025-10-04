import { ImageRes, ProfilePicture, CoverPhoto } from './image.types';
import { Permission } from './role.types';

export interface CurrentUserRes {
  id: string;
  name: string;
  displayName?: string;
  bio?: string;
  anonymous: boolean;
  permissions: Permission[];
  profilePicture: ImageRes | null;
  coverPhoto: ImageRes | null;
}

export interface UserRes {
  id: string;
  name: string;
  displayName?: string;
  profilePictureId?: string;
  coverPhotoId?: string;
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
  profilePicture: ProfilePicture | null;
  coverPhoto: CoverPhoto | null;
}
