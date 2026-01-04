// TODO: Add show password toggle

import { api } from '@/client/api-client';
import {
  LocalStorageKeys,
  NavigationPaths,
} from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { t } from '@/lib/shared.utils';
import { useAppStore } from '@/store/app.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import * as zod from 'zod';
import { handleError } from '../../lib/error.utils';
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
import {
  EMAIL_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  VALID_NAME_REGEX,
} from '@common/users/user.constants';

const signUpFormSchema = zod
  .object({
    name: zod
      .string()
      .min(NAME_MIN_LENGTH, {
        message: t('auth.errors.shortName'),
      })
      .max(NAME_MAX_LENGTH, {
        message: t('auth.errors.longName'),
      })
      .regex(VALID_NAME_REGEX, {
        message: t('users.errors.invalidName'),
      }),
    email: zod
      .email({
        message: t('auth.errors.invalidEmail'),
      })
      .max(EMAIL_MAX_LENGTH, {
        message: t('auth.errors.longEmail'),
      }),
    password: zod
      .string()
      .min(PASSWORD_MIN_LENGTH, {
        message: t('auth.errors.passwordTooShort'),
      })
      .max(PASSWORD_MAX_LENGTH, {
        message: t('auth.errors.passwordTooLong'),
      }),
    confirmPassword: zod
      .string()
      .min(PASSWORD_MIN_LENGTH, {
        message: t('auth.errors.passwordTooShort'),
      })
      .max(PASSWORD_MAX_LENGTH, {
        message: t('auth.errors.passwordTooLong'),
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: t('auth.errors.passwordsDoNotMatch'),
    path: ['confirmPassword'],
  });

interface Props {
  setIsRedirecting: (isRedirecting: boolean) => void;
}

export const SignUpForm = ({ setIsRedirecting }: Props) => {
  const { setIsLoggedIn, setAccessToken } = useAppStore();

  const form = useForm<zod.infer<typeof signUpFormSchema>>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { isAnon } = useAuthData();

  const { t } = useTranslation();
  const { token } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: signUp, isPending: isSignUpPending } = useMutation({
    mutationFn: async (values: zod.infer<typeof signUpFormSchema>) => {
      return api.signUp({ ...values, inviteToken: token });
    },
    onSuccess({ access_token }) {
      localStorage.setItem(LocalStorageKeys.AccessToken, access_token);
      localStorage.removeItem(LocalStorageKeys.InviteToken);
      setAccessToken(access_token);
      navigate(NavigationPaths.Home);
      setIsLoggedIn(true);
    },
    onError(error: Error) {
      handleError(error);
    },
  });

  const { mutate: upgradeAnon, isPending: isUpgradeAnonPending } = useMutation({
    mutationFn: async (values: zod.infer<typeof signUpFormSchema>) => {
      return api.upgradeAnonSession({ ...values, inviteToken: token });
    },
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ['me'] });
      navigate(NavigationPaths.Home);
      setIsRedirecting(true);
    },
    onError(error: Error) {
      handleError(error);
    },
  });

  const isPending = isSignUpPending || isUpgradeAnonPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((fv) =>
          isAnon ? upgradeAnon(fv) : signUp(fv),
        )}
        className="space-y-4 pb-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.labels.username')}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder={t('auth.placeholders.username')}
                  autoComplete="username"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.labels.email')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('auth.placeholders.email')}
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.labels.password')}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t('auth.prompts.createPassword')}
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('auth.labels.confirmPassword')}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t('auth.placeholders.confirmPassword')}
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {t('auth.actions.createAccount')}
        </Button>
      </form>
    </Form>
  );
};
