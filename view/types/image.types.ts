export interface ImageRes {
  id: string;
  isPlaceholder?: boolean;
  createdAt: string;
}

export interface ProfilePicture extends ImageRes {
  url: string;
}
