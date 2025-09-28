import { api } from '@/client/api-client';
import { CurrentUserRes, UpdateUserProfileReq } from '@/types/user.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as zod from 'zod';
import { handleError } from '../../lib/error.utils';
import { t } from '../../lib/shared.utils';
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

const VALID_NAME_REGEX = /^[A-Za-z0-9 ]+$/;
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 15;
const MIN_DISPLAY_NAME_LENGTH = 4;
const MAX_DISPLAY_NAME_LENGTH = 30;
const MAX_BIO_LENGTH = 500;

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
});

interface Props {
  currentUser: CurrentUserRes;
}

export const UserProfileForm = ({ currentUser }: Props) => {
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
        await api.updateUserProfile(data);
        return data;
      },
      onSuccess: (data) => {
        queryClient.setQueryData<{ user: CurrentUserRes }>(
          ['me'],
          (oldData) => {
            if (!oldData) {
              throw new Error('User data not found');
            }
            return {
              user: {
                ...oldData.user,
                ...data,
              },
            };
          },
        );
      },
      onError: (error: Error) => {
        handleError(error);
      },
    },
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => updateUserProfile(v))}
        className="flex flex-col gap-4"
      >
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
            form.formState.isSubmitting ||
            !form.formState.isValid
          }
        >
          {t('users.actions.save')}
        </Button>
      </form>
    </Form>
  );
};
