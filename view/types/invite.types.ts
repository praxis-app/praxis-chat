export interface InviteRes {
  id: string;
  token: string;
  uses: number;
  maxUses?: number;
  user: {
    id: string;
    name: string;
    displayName?: string;
    profilePictureId?: string;
  };
  expiresAt?: string;
  createdAt: string;
}

export interface CreateInviteReq {
  maxUses?: number;
  expiresAt?: Date;
}
