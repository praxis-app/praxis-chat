export interface ServerReq {
  name: string;
  slug: string;
  description: string;
}

export interface ServerRes {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}
