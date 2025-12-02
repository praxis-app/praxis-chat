import { api } from '@/client/api-client';
import { handleError } from '@/lib/error.utils';
import { cn, t } from '@/lib/shared.utils';
import { ServerReq, ServerRes } from '@/types/server.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as zod from 'zod';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
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

const serverFormSchema = zod.object({
  name: zod
    .string()
    .trim()
    .min(2, {
      message: t('errors.fieldRequired'),
    }),
  slug: zod
    .string()
    .trim()
    .min(2, {
      message: t('errors.fieldRequired'),
    })
    .regex(/^[a-z0-9-]+$/, {
      message: t('servers.errors.invalidSlug'),
    }),
  description: zod
    .string()
    .trim()
    .min(1, {
      message: t('errors.fieldRequired'),
    }),
});

export const CreateServerForm = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<ServerReq>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  const { mutate: createServer, isPending } = useMutation({
    mutationFn: async (values: ServerReq) => {
      const { server } = await api.createServer(values);

      queryClient.setQueryData<{ servers: ServerRes[] }>(
        ['servers'],
        (oldData) => {
          if (!oldData) {
            return { servers: [server] };
          }
          return { servers: [server, ...oldData.servers] };
        },
      );

      form.reset();
    },
    onError(error: Error) {
      handleError(error);
    },
  });

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  return (
    <Card className="mb-4">
      <CardContent className="space-y-4 px-4 pt-4 pb-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {t('servers.headers.create')}
          </h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((fv) => createServer(fv))}
            className={cn('space-y-4')}
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('servers.form.name')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value);
                        if (!form.getFieldState('slug').isDirty) {
                          form.setValue('slug', slugify(value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('servers.form.slug')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      onChange={(e) => {
                        const value = slugify(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('servers.form.description')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? t('servers.prompts.creating') : t('actions.create')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
