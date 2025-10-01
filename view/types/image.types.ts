export interface ImageRes {
  id: string;
  isPlaceholder?: boolean;
  createdAt: string;
}

export interface ProfilePicture extends ImageRes {
  url: string;
}

export interface CoverPhoto extends ImageRes {
  url: string;
}
