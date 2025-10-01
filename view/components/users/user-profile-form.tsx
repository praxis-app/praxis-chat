import { api } from '@/client/api-client';
import { validateImageInput } from '@/lib/image.utilts';
import { CurrentUser, UpdateUserProfileReq } from '@/types/user.types';
import {
  MAX_BIO_LENGTH,
  MAX_DISPLAY_NAME_LENGTH,
  MAX_NAME_LENGTH,
  MIN_DISPLAY_NAME_LENGTH,
  MIN_NAME_LENGTH,
  VALID_NAME_REGEX,
} from '@common/users/users.constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as zod from 'zod';
import { handleError } from '../../lib/error.utils';
import { t } from '../../lib/shared.utils';
import { ImageInput } from '../images/image-input';
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
import { UserAvatar } from './user-avatar';

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
  currentUser: CurrentUser;
}

export const UserProfileForm = ({ currentUser }: Props) => {
  const [selectedProfilePicture, setSelectedProfilePicture] =
    useState<File | null>(null);

  const avatarRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<zod.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: currentUser.name,
      displayName: currentUser.displayName,
      bio: currentUser.bio,
    },
    mode: 'onChange',
  });

  const { mutate: updateUserProfile, isPending: isUpdatePending } = useMutation(
    {
      mutationFn: async (data: UpdateUserProfileReq) => {
        let profilePicture = currentUser.profilePicture;

        if (selectedProfilePicture) {
          validateImageInput(selectedProfilePicture);
          const formData = new FormData();
          formData.append('file', selectedProfilePicture);
          const { image } = await api.uploadUserProfilePicture(formData);
          const url = URL.createObjectURL(selectedProfilePicture);
          profilePicture = { ...image, url };
        }
        await api.updateUserProfile(data);

        return { ...data, profilePicture };
      },
      onSuccess: (data) => {
        queryClient.setQueryData<{ user: CurrentUser }>(['me'], (oldData) => {
          if (!oldData) {
            throw new Error('User data not found');
          }

          const nameChanged = oldData.user.name !== data.name;
          const displayChanged = oldData.user.displayName !== data.displayName;
          const bioChanged = oldData.user.bio !== data.bio;
          const profilePictureChanged =
            oldData.user.profilePicture?.id !== data.profilePicture?.id;

          return {
            user: {
              ...oldData.user,
              name: nameChanged ? String(data.name) : oldData.user.name,
              displayName: displayChanged
                ? data.displayName
                : oldData.user.displayName,
              bio: bioChanged ? data.bio : oldData.user.bio,
              profilePicture: profilePictureChanged
                ? data.profilePicture
                : oldData.user.profilePicture,
            },
          };
        });
        form.reset(form.getValues());
        setSelectedProfilePicture(null);
        toast(t('users.actions.profileUpdated'));
      },
      onError: (error: Error) => {
        handleError(error);
      },
    },
  );

  const handleImageChange = (files: File[]) => {
    if (files.length === 0) {
      setSelectedProfilePicture(null);
      return;
    }
    setSelectedProfilePicture(files[0]);
  };

  const getImageSrc = () => {
    if (selectedProfilePicture) {
      return URL.createObjectURL(selectedProfilePicture);
    }
    return currentUser.profilePicture?.url;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => updateUserProfile(v))}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col items-center gap-2">
          <div ref={avatarRef}>
            <UserAvatar
              name={currentUser.name}
              userId={currentUser.id}
              imageSrc={getImageSrc()}
              className="size-20"
              fallbackClassName="text-2xl"
            />
          </div>

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
              {selectedProfilePicture
                ? t('users.actions.changePicture')
                : t('users.actions.selectPicture')}
            </button>
          </ImageInput>
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
            (!form.formState.isDirty && !selectedProfilePicture)
          }
        >
          {t('users.actions.save')}
        </Button>
      </form>
    </Form>
  );
};
