import { api } from '@/client/api-client';
import { FormattedText } from '@/components/shared/formatted-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/users/user-avatar';
import { UserProfileDrawer } from '@/components/users/user-profile-drawer';
import { MIDDOT_WITH_SPACES } from '@/constants/shared.constants';
import { useServerData } from '@/hooks/use-server-data';
import { handleError } from '@/lib/error.utils';
import { cn } from '@/lib/shared.utils';
import { truncate } from '@/lib/text.utils';
import { timeAgo, timeFromNow } from '@/lib/time.utils';
import { ChannelRes, FeedItemRes, FeedQuery } from '@/types/channel.types';
import { PollRes } from '@/types/poll.types';
import { CurrentUser } from '@/types/user.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FaChartBar } from 'react-icons/fa';
import { LuCheck, LuCircle } from 'react-icons/lu';
import * as z from 'zod';

const inlinePollFormSchema = z.object({
  selectedOptions: z.array(z.string()),
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

  const { id, body, user, options, config, myVote, votes, createdAt } = poll;
  const isMultipleChoice = config?.multipleChoice ?? false;
  const hasVoted = !!myVote?.pollOptionIds?.length;
  const totalVotes = votes?.length ?? 0;

  const name = user.displayName || user.name;
  const truncatedName = truncate(name, 18);
  const formattedDate = timeAgo(createdAt);

  const form = useForm<InlinePollFormSchema>({
    resolver: zodResolver(inlinePollFormSchema),
    defaultValues: {
      selectedOptions: myVote?.pollOptionIds ?? [],
    },
  });

  const updateFeedCache = (newMyVote: typeof myVote) => {
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
                myVote: newMyVote,
              };
            }
            return item;
          }),
        }));
        return { pages, pageParams: old.pageParams };
      },
    );
  };

  const { mutate: submitVote, isPending: isSubmitting } = useMutation({
    mutationFn: async (values: InlinePollFormSchema) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      if (myVote?.id) {
        await api.updateVote(serverId, channel.id, id, myVote.id, {
          pollOptionIds: values.selectedOptions,
        });
        return { voteId: myVote.id, selectedOptions: values.selectedOptions };
      }
      const { vote } = await api.createVote(serverId, channel.id, id, {
        pollOptionIds: values.selectedOptions,
      });
      return { voteId: vote.id, selectedOptions: values.selectedOptions };
    },
    onSuccess: ({ voteId, selectedOptions }) => {
      updateFeedCache({
        id: voteId,
        pollOptionIds: selectedOptions,
      });
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });

  const { mutate: removeVote, isPending: isRemoving } = useMutation({
    mutationFn: async () => {
      if (!serverId || !myVote?.id) {
        throw new Error('Cannot remove vote');
      }
      return api.deleteVote(serverId, channel.id, id, myVote.id);
    },
    onSuccess: () => {
      form.setValue('selectedOptions', []);
      updateFeedCache(undefined);
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });

  const handleOptionToggle = (optionId: string) => {
    const currentOptions = form.getValues('selectedOptions');
    const isSelected = currentOptions.includes(optionId);

    if (isMultipleChoice) {
      if (isSelected) {
        form.setValue(
          'selectedOptions',
          currentOptions.filter((id) => id !== optionId),
        );
      } else {
        form.setValue('selectedOptions', [...currentOptions, optionId]);
      }
    } else {
      form.setValue('selectedOptions', isSelected ? [] : [optionId]);
    }
  };

  const handleSubmit = () => {
    const selectedOptions = form.getValues('selectedOptions');
    if (selectedOptions.length === 0) {
      return;
    }
    submitVote({ selectedOptions });
  };

  const isPending = isSubmitting || isRemoving;
  const selectedOptions = form.watch('selectedOptions');

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
                      const isSelected = selectedOptions.includes(option.id);

                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleOptionToggle(option.id)}
                          disabled={isPending}
                          className={cn(
                            'flex w-full cursor-pointer items-center justify-between rounded-md border px-3 py-2.5 text-left transition-colors',
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-input bg-background hover:bg-accent',
                            isPending && 'cursor-not-allowed opacity-50',
                          )}
                        >
                          <span className="text-sm">{option.text}</span>
                          {isSelected ? (
                            <div className="bg-primary text-primary-foreground flex size-5 items-center justify-center rounded-full">
                              <LuCheck className="size-3" />
                            </div>
                          ) : (
                            <LuCircle className="text-muted-foreground size-5" />
                          )}
                        </button>
                      );
                    })}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-4">
                {hasVoted ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                    onClick={() => removeVote()}
                    className="w-full"
                  >
                    {t('polls.actions.removeVote')}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    disabled={isPending || selectedOptions.length === 0}
                    onClick={handleSubmit}
                    className="w-full"
                  >
                    {t('polls.actions.vote')}
                  </Button>
                )}
              </div>
            </form>
          </Form>

          <Separator className="my-1" />

          <div className="text-muted-foreground text-sm">
            {t('polls.labels.totalVotes', { count: totalVotes })}
            {config?.closingAt && (
              <>
                {MIDDOT_WITH_SPACES}
                {timeFromNow(config.closingAt, true)}
              </>
            )}
            {!config?.closingAt && (
              <>
                {MIDDOT_WITH_SPACES}
                <span className="text-lg">{t('time.infinity')}</span>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
