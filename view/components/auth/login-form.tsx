// TODO: Add show password toggle

import { api } from '@/client/api-client';
import {
  LocalStorageKeys,
  NavigationPaths,
} from '@/constants/shared.constants';
import { t } from '@/lib/shared.utils';
import { useAppStore } from '@/store/app.store';
import {
  EMAIL_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '@common/users/user.constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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

const loginFormSchema = zod.object({
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
});

export const LoginForm = () => {
  const { setIsLoggedIn } = useAppStore();

  const form = useForm<zod.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { mutate: login, isPending: isLoginPending } = useMutation({
    mutationFn: api.login,
    onSuccess({ access_token }) {
      localStorage.setItem(LocalStorageKeys.AccessToken, access_token);
      navigate(NavigationPaths.Home);
      setIsLoggedIn(true);
    },
    onError(error: Error) {
      handleError(error);
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((fv) => login(fv))}
        className="space-y-4 pb-4"
      >
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
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoginPending}>
          {t('auth.actions.signIn')}
        </Button>
      </form>
    </Form>
  );
};
