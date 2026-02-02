import { api } from '@/client/api-client';
import { FormattedText } from '@/components/shared/formatted-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { UserAvatar } from '@/components/users/user-avatar';
import { UserProfileDrawer } from '@/components/users/user-profile-drawer';
import { useServerData } from '@/hooks/use-server-data';
import { handleError } from '@/lib/error.utils';
import { truncate } from '@/lib/text.utils';
import { timeAgo } from '@/lib/time.utils';
import { ChannelRes, FeedItemRes, FeedQuery } from '@/types/channel.types';
import { PollRes } from '@/types/poll.types';
import { CurrentUser } from '@/types/user.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FaChartBar } from 'react-icons/fa';
import * as z from 'zod';

const inlinePollFormSchema = z.object({
  selectedOptions: z.array(z.string()).min(1, 'polls.errors.selectAtLeastOne'),
});

type InlinePollFormSchema = z.infer<typeof inlinePollFormSchema>;

interface Props {
  poll: PollRes;
  channel: ChannelRes;
  me?: CurrentUser;
}

export const InlinePoll = ({ poll, channel, me }: Props) => {
  const { t } = useTranslation();
  const { serverId } = useServerData();
  const queryClient = useQueryClient();

  const { id, body, user, options, config, myVote, createdAt } = poll;
  const isMultipleChoice = config?.multipleChoice ?? false;

  const name = user.displayName || user.name;
  const truncatedName = truncate(name, 18);
  const formattedDate = timeAgo(createdAt);

  const form = useForm<InlinePollFormSchema>({
    resolver: zodResolver(inlinePollFormSchema),
    defaultValues: {
      selectedOptions: myVote?.pollOptionIds ?? [],
    },
  });

  const { mutate: submitVote, isPending } = useMutation({
    mutationFn: async (values: InlinePollFormSchema) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      if (myVote) {
        return api.updateVote(serverId, channel.id, id, myVote.id, {
          pollOptionIds: values.selectedOptions,
        });
      }
      return api.createVote(serverId, channel.id, id, {
        pollOptionIds: values.selectedOptions,
      });
    },
    onSuccess: () => {
      const selectedOptionIds = form.getValues('selectedOptions');

      queryClient.setQueryData<FeedQuery>(
        ['servers', serverId, 'channels', channel.id, 'feed'],
        (old) => {
          if (!old) {
            return old;
          }
          const pages = old.pages.map((page) => ({
            feed: page.feed.map((item: FeedItemRes) => {
              if (item.type === 'poll' && item.id === id) {
                return {
                  ...item,
                  myVote: {
                    id: myVote?.id ?? 'temp-vote-id',
                    pollOptionIds: selectedOptionIds,
                  },
                };
              }
              return item;
            }),
          }));
          return { pages, pageParams: old.pageParams };
        },
      );
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });

  const handleOptionChange = (optionId: string, checked: boolean) => {
    const currentOptions = form.getValues('selectedOptions');

    if (isMultipleChoice) {
      if (checked) {
        form.setValue('selectedOptions', [...currentOptions, optionId]);
        return;
      }
      form.setValue(
        'selectedOptions',
        currentOptions.filter((id) => id !== optionId),
      );
      return;
    }
    form.setValue('selectedOptions', checked ? [optionId] : []);
  };

  const handleSubmit = () => {
    form.handleSubmit((values) => submitVote(values))();
  };

  return (
    <div className="flex gap-4 pt-4">
      <UserProfileDrawer
        name={truncatedName}
        userId={user.id}
        me={me}
        trigger={
          <button className="shrink-0 cursor-pointer self-start">
            <UserAvatar
              name={name}
              userId={user.id}
              imageId={user.profilePicture?.id}
              className="mt-0.5"
            />
          </button>
        }
      />

      <div className="w-full">
        <div className="flex items-center gap-1.5 pb-1">
          <UserProfileDrawer
            name={truncatedName}
            userId={user.id}
            me={me}
            trigger={
              <button className="cursor-pointer font-medium">
                {truncatedName}
              </button>
            }
          />
          <div className="text-muted-foreground text-sm">{formattedDate}</div>
        </div>

        <Card className="before:border-l-border relative w-full gap-3.5 rounded-md px-3 py-3.5 before:absolute before:top-0 before:bottom-0 before:left-0 before:mt-[-0.025rem] before:mb-[-0.025rem] before:w-3 before:rounded-l-md before:border-l-3">
          <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
            <FaChartBar className="mb-0.5" />
            {t('polls.labels.poll')}
          </div>

          {body && <FormattedText text={body} className="pt-1 pb-2" />}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <Label className="text-muted-foreground mb-3 text-sm font-normal">
                {isMultipleChoice
                  ? t('polls.labels.selectMultiple')
                  : t('polls.labels.selectOne')}
              </Label>

              <FormField
                control={form.control}
                name="selectedOptions"
                render={() => (
                  <FormItem className="space-y-2">
                    {options?.map((option) => {
                      const isSelected = form
                        .watch('selectedOptions')
                        .includes(option.id);

                      return (
                        <FormItem
                          key={option.id}
                          className="flex items-center gap-2 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                handleOptionChange(option.id, !!checked)
                              }
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer font-normal">
                            {option.text}
                          </FormLabel>
                        </FormItem>
                      );
                    })}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="mt-4"
              >
                {t('polls.actions.vote')}
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};
