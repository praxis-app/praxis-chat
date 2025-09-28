import { api } from '@/client/api-client';
import { validateImageInput } from '@/lib/image.utilts';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { handleError } from '../../lib/error.utils';
import { ImageInput } from '../images/image-input';
import { UserAvatar } from './user-avatar';

interface Props {
  name: string;
  userId?: string | null;
  profilePictureId?: string;
  onImageUploaded: () => void;
  disabled?: boolean;
}

export const ProfilePictureUpload = ({
  name,
  userId,
  profilePictureId,
  onImageUploaded,
  disabled,
}: Props) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);

  const { mutate: uploadImage } = useMutation({
    mutationFn: async (file: File) => {
      validateImageInput(file);
      return api.uploadUserProfilePicture(file);
    },
    onSuccess: () => {
      onImageUploaded();
      setIsUploading(false);
      toast(t('users.actions.profilePictureUpdated'));
    },
    onError: (error: Error) => {
      handleError(error);
      setIsUploading(false);
    },
  });

  const handleImageChange = (files: File[]) => {
    if (files.length === 0) {
      return;
    }
    
    setIsUploading(true);
    uploadImage(files[0]);
  };

  const getImageSrc = () => {
    if (profilePictureId) {
      return `/api/images/${profilePictureId}`;
    }
    return undefined;
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <UserAvatar
        name={name}
        userId={userId}
        imageSrc={getImageSrc()}
        className="size-20"
        fallbackClassName="text-2xl"
      />
      
      <ImageInput
        onChange={handleImageChange}
        disabled={disabled || isUploading}
        iconClassName="text-muted-foreground size-5"
      >
        <button
          type="button"
          disabled={disabled || isUploading}
          className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {isUploading ? t('users.actions.uploading') : t('users.actions.changePicture')}
        </button>
      </ImageInput>
    </div>
  );
};