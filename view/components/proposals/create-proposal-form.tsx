import { api } from '@/client/api-client';
import { GENERAL_CHANNEL_NAME } from '@/constants/channel.constants';
import { PROPOSAL_ACTION_TYPE } from '@/constants/proposal.constants';
import { t } from '@/lib/shared.utils';
import { FeedItem, FeedQuery } from '@/types/channel.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as zod from 'zod';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';

const PROPOSAL_BODY_MAX = 6000;

interface CreateProposalFormProps {
  channelId?: string;
  isGeneralChannel?: boolean;
  onSuccess?: () => void;
}

const formSchema = zod.object({
  body: zod
    .string()
    .min(1)
    .max(PROPOSAL_BODY_MAX, {
      message: t('proposals.errors.longBody'),
    }),
  action: zod.enum([...PROPOSAL_ACTION_TYPE, '']),
});

export const CreateProposalForm = ({
  channelId,
  isGeneralChannel,
  onSuccess,
}: CreateProposalFormProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<zod.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { body: '', action: '' },
  });

  const { mutate: createProposal, isPending } = useMutation({
    mutationFn: async (values: zod.infer<typeof formSchema>) => {
      if (!channelId) {
        throw new Error('Channel ID is required');
      }
      if (!values.action) {
        throw new Error('Action is required');
      }
      return api.createProposal(channelId, {
        body: values.body.trim(),
        action: { actionType: values.action },
        images: [],
      });
    },
    onSuccess: ({ proposal }) => {
      form.reset();

      const resolvedChannelId = isGeneralChannel
        ? GENERAL_CHANNEL_NAME
        : channelId;

      if (!resolvedChannelId) {
        return;
      }

      // Optimistically insert new proposal at top of feed (no refetch)
      queryClient.setQueryData<FeedQuery>(
        ['feed', resolvedChannelId],
        (old) => {
          const newItem: FeedItem = {
            ...proposal,
            type: 'proposal',
          };
          if (!old) {
            return { pages: [{ feed: [newItem] }], pageParams: [0] };
          }
          const pages = old.pages.map((page, idx) => {
            if (idx !== 0) {
              return page;
            }
            const exists = page.feed.some(
              (fi) => fi.type === 'proposal' && fi.id === proposal.id,
            );
            if (exists) {
              return page;
            }
            return { feed: [newItem, ...page.feed] };
          });
          return { pages, pageParams: old.pageParams };
        },
      );

      onSuccess?.();
    },
    onError: () => {
      toast(t('proposals.errors.errorCreatingProposal'), {
        description: t('prompts.tryAgain'),
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => createProposal(values))}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="action"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('proposals.labels.actionType')}</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('proposals.placeholders.action')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPOSAL_ACTION_TYPE.map((action) => (
                      <SelectItem key={action} value={action}>
                        {t(`proposals.actionTypes.${action}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('proposals.labels.body')}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t('proposals.placeholders.body')}
                  className="w-full resize-none md:min-w-md"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isPending || !channelId}>
            {isPending ? t('actions.submit') : t('proposals.actions.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
