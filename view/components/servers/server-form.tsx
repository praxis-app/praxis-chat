import { cn } from '@/lib/shared.utils';
import { ServerReq, ServerRes } from '@/types/server.types';
import { ServerErrorKeys } from '@common/servers/server.constants';
import { serverFormSchema } from '@common/servers/server.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

interface Props {
  editServer?: ServerRes;
  isSubmitting: boolean;
  onSubmit: (data: ServerReq) => Promise<ServerRes | void>;
  className?: string;
}

export const ServerForm = ({
  editServer,
  isSubmitting,
  onSubmit,
  className,
}: Props) => {
  const { t } = useTranslation();

  // TODO: Clean up default values and values assignment

  const form = useForm<ServerReq>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: editServer
      ? {
          name: editServer.name,
          slug: editServer.slug,
          description: editServer.description ?? '',
          isDefaultServer: editServer.isDefaultServer,
        }
      : {
          name: '',
          slug: '',
          description: '',
          isDefaultServer: false,
        },
    values: editServer
      ? {
          name: editServer.name,
          slug: editServer.slug,
          description: editServer.description ?? '',
          isDefaultServer: editServer.isDefaultServer,
        }
      : undefined,
  });

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const handleSubmitForm = async (data: ServerReq) => {
    const result = await onSubmit(data);

    if (editServer) {
      const nextValues = result
        ? {
            name: result.name,
            slug: result.slug,
            description: result.description ?? '',
            isDefaultServer: result.isDefaultServer,
          }
        : {
            name: editServer.name,
            slug: editServer.slug,
            description: editServer.description ?? '',
            isDefaultServer: editServer.isDefaultServer,
          };
      form.reset(nextValues);
      return;
    }

    form.reset({
      name: '',
      slug: '',
      description: '',
      isDefaultServer: false,
    });
  };

  const isSubmitDisabled = () => {
    if (isSubmitting) {
      return true;
    }
    if (editServer) {
      return !form.formState.isDirty;
    }
    return false;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((fv) => handleSubmitForm(fv))}
        className={cn('space-y-4', className)}
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
              <FormMessage
                errorOverrides={{
                  [ServerErrorKeys.NameLength]: t('servers.errors.nameLength'),
                }}
              />
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
              <FormMessage
                errorOverrides={{
                  [ServerErrorKeys.SlugLength]: t('servers.errors.slugLength'),
                  [ServerErrorKeys.SlugInvalid]: t(
                    'servers.errors.invalidSlug',
                  ),
                }}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="mb-5">
              <FormLabel>{t('servers.form.description')}</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage
                errorOverrides={{
                  [ServerErrorKeys.DescriptionLength]: t(
                    'servers.errors.descriptionLength',
                  ),
                }}
              />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isDefaultServer"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>{t('servers.form.defaultServer')}</FormLabel>
                <FormDescription>
                  {t('servers.form.defaultServerDescription')}
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={(checked) => field.onChange(checked)}
                  aria-label={t('servers.form.defaultServer')}
                  disabled={editServer?.isDefaultServer}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitDisabled()} className="w-22">
            {editServer ? t('actions.save') : t('actions.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
