import { api } from '@/client/api-client';
import { CurrentUserRes, UpdateUserProfileReq } from '@/types/user.types';
import {
  MAX_BIO_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_NAME_LENGTH,
  MIN_DISPLAY_NAME_LENGTH,
  MIN_NAME_LENGTH,
  VALID_NAME_REGEX,
} from '@common/users/users.constants';
import { validateImageInput } from '@/lib/image.utilts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as zod from 'zod';
import { handleError } from '../../lib/error.utils';
import { t } from '../../lib/shared.utils';
import { ImageInput } from '../images/image-input';
import { UserAvatar } from './user-avatar';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

const userProfileSchema = zod.object({
  name: zod
    .string()
    .min(MIN_NAME_LENGTH, {
      message: t('users.errors.shortName'),
    })
    .max(MAX_NAME_LENGTH, {
      message: t('users.errors.longName'),
    })
    .regex(VALID_NAME_REGEX, {
      message: t('users.errors.invalidName'),
    }),
  displayName: zod
    .string()
    .min(MIN_DISPLAY_NAME_LENGTH, {
      message: t('users.errors.shortDisplayName'),
    })
    .max(MAX_DISPLAY_NAME_LENGTH, {
      message: t('users.errors.longDisplayName'),
    })
    .optional()
    .or(zod.literal('')),
  bio: zod
    .string()
    .max(MAX_BIO_LENGTH, {
      message: t('users.errors.longBio'),
    })
    .optional()
    .or(zod.literal('')),
  profilePicture: zod.instanceof(File).optional(),
});

interface Props {
  currentUser: CurrentUserRes;
}

export const UserProfileForm = ({ currentUser }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const { data: profilePictureData } = useQuery({
    queryKey: ['profile-picture', currentUser.id],
    queryFn: () => api.getUserProfilePicture(currentUser.id),
    enabled: !!currentUser.id,
  });

  const form = useForm<zod.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: currentUser.name,
      displayName: currentUser.displayName || '',
      bio: currentUser.bio || '',
    },
    mode: 'onChange',
  });

  const { mutate: updateUserProfile, isPending: isUpdatePending } = useMutation(
    {
      mutationFn: async (
        data: UpdateUserProfileReq & { profilePicture?: File },
      ) => {
        // Upload profile picture first if one is selected
        if (data.profilePicture) {
          try {
            validateImageInput(data.profilePicture);
            await api.uploadUserProfilePicture(data.profilePicture);
            // Invalidate profile picture query to refresh the image
            queryClient.invalidateQueries({
              queryKey: ['profile-picture', currentUser.id],
            });
          } catch (error) {
            handleError(error as Error);
            throw error;
          }
        }

        // Update user profile
        const { profilePicture: _profilePicture, ...profileData } = data;
        await api.updateUserProfile(profileData);
        return profileData;
      },
      onSuccess: (data) => {
        queryClient.setQueryData<{ user: CurrentUserRes }>(
          ['me'],
          (oldData) => {
            if (!oldData) {
              throw new Error('User data not found');
            }

            const nameChanged = oldData.user.name !== data.name;
            const bioChanged = oldData.user.bio !== data.bio;
            const displayNameChanged =
              oldData.user.displayName !== data.displayName;

            return {
              user: {
                ...oldData.user,
                name: nameChanged ? String(data.name) : oldData.user.name,
                bio: bioChanged ? data.bio : oldData.user.bio,
                displayName: displayNameChanged
                  ? data.displayName
                  : oldData.user.displayName,
              },
            };
          },
        );
        form.reset(form.getValues());
        setSelectedImage(null);
        toast(t('users.actions.profileUpdated'));
      },
      onError: (error: Error) => {
        handleError(error);
      },
    },
  );

  const handleImageChange = (files: File[]) => {
    if (files.length === 0) {
      setSelectedImage(null);
      return;
    }
    setSelectedImage(files[0]);
  };

  const getImageSrc = () => {
    if (selectedImage) {
      return URL.createObjectURL(selectedImage);
    }
    if (profilePictureData?.image?.id) {
      return `/api/images/${profilePictureData.image.id}`;
    }
    return undefined;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) =>
          updateUserProfile({
            ...v,
            profilePicture: selectedImage || undefined,
          }),
        )}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col items-center gap-2">
          <UserAvatar
            name={currentUser.name}
            userId={currentUser.id}
            imageSrc={getImageSrc()}
            className="size-20"
            fallbackClassName="text-2xl"
          />

          <ImageInput
            onChange={handleImageChange}
            disabled={isUpdatePending}
            iconClassName="text-muted-foreground size-5"
          >
            <button
              type="button"
              disabled={isUpdatePending}
              className="text-muted-foreground hover:text-foreground text-sm disabled:opacity-50"
            >
              {selectedImage
                ? t('users.actions.changePicture')
                : t('users.actions.selectPicture')}
            </button>
          </ImageInput>

          {selectedImage && (
            <p className="text-muted-foreground text-xs">
              {t('users.prompts.pictureWillBeUpdated')}
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('users.form.name')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('users.placeholders.name')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('users.form.displayName')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('users.placeholders.displayName')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('users.form.bio')}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t('users.placeholders.bio')}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={
            isUpdatePending ||
            !form.formState.isValid ||
            (!form.formState.isDirty && !selectedImage)
          }
        >
          {t('users.actions.save')}
        </Button>
      </form>
    </Form>
  );
};
