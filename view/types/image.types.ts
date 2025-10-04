export interface ImageRes {
  id: string;
  isPlaceholder?: boolean;
  createdAt: string;
}

// TODO: Rename to be more specific to `CurrentUser`, or remove if no longer helpful
export interface ProfilePicture extends ImageRes {
  url: string;
}

// TODO: Rename to be more specific to `CurrentUser`, or remove if no longer helpful
export interface CoverPhoto extends ImageRes {
  url: string;
}
