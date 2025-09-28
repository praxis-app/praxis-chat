import { Permission } from './role.types';

export interface CurrentUserRes {
  id: string;
  name: string;
  anonymous: boolean;
  permissions: Permission[];
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
