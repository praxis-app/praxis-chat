import { api } from '@/client/api-client';
import { NavigationPaths } from '@/constants/shared.constants';
import { cn } from '@/lib/shared.utils';
import { ChannelRes, CreateChannelReq } from '@/types/channel.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as zod from 'zod';
import { useServerData } from '@/hooks/use-server-data';
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
import { Textarea } from '../ui/textarea';

interface CreateChannelFormSubmitButtonProps {
  isSubmitting: boolean;
}

interface CreateChannelFormProps {
  submitButton: (props: CreateChannelFormSubmitButtonProps) => ReactNode;
  onSubmit?(): void;
  className?: string;
}

const createChannelFormSchema = zod.object({
  name: zod.string(),
  description: zod.string(),
});

export const CreateChannelFormSubmitButton = ({
  isSubmitting,
}: CreateChannelFormSubmitButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting
        ? t('channels.prompts.creatingChannel')
        : t('channels.actions.create')}
    </Button>
  );
};

export const CreateChannelForm = ({
  submitButton,
  onSubmit,
  className,
}: CreateChannelFormProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { serverId } = useServerData();

  const form = useForm<zod.infer<typeof createChannelFormSchema>>({
    resolver: zodResolver(createChannelFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const { mutate: createChannel, isPending } = useMutation({
    mutationFn: async (values: CreateChannelReq) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      const { channel } = await api.createChannel(serverId, values);

      queryClient.setQueryData<{ channels: ChannelRes[] }>(
        ['channels'],
        (oldData) => {
          if (!oldData) {
            return { channels: [] };
          }
          return { channels: [...oldData.channels, channel] };
        },
      );

      onSubmit?.();

      navigate(`${NavigationPaths.Channels}/${channel.id}`);
    },
    onError(error: Error) {
      handleError(error);
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((fv) => createChannel(fv))}
        className={cn('space-y-4 pb-4', className)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('channels.form.name')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="off"
                  onChange={(e) => {
                    e.target.value = e.target.value
                      .replace(/\s/g, '-')
                      .toLocaleLowerCase();
                    field.onChange(e);
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
              <FormLabel>{t('channels.form.description')}</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitButton({ isSubmitting: isPending })}
      </form>
    </Form>
  );
};
