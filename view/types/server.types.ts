export interface ServerReq {
  name: string;
  slug: string;
  description?: string;
  isDefaultServer?: boolean;
}

export interface ServerRes {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isDefaultServer?: boolean;
  memberCount?: number;
  createdAt: Date;
  updatedAt: Date;
}
