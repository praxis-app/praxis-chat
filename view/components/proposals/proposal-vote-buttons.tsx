import { api } from '@/client/api-client';
import { GENERAL_CHANNEL_NAME } from '@/constants/channel.constants';
import { cn } from '@/lib/shared.utils';
import { ChannelRes, FeedItemRes } from '@/types/channel.types';
import { VOTE_TYPES } from '@common/votes/vote.constants';
import { VoteType } from '@common/votes/vote.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface Props {
  channel: ChannelRes;
  myVote?: { id: string; voteType: VoteType };
  proposalId: string;
}

export const ProposalVoteButtons = ({ channel, proposalId, myVote }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutate: castVote, isPending } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      if (!myVote) {
        const { vote } = await api.createVote(channel.id, proposalId, {
          voteType,
        });
        return { action: 'create' as const, voteId: vote.id, voteType };
      }
      if (myVote.voteType === voteType) {
        await api.deleteVote(channel.id, proposalId, myVote.id);
        return { action: 'delete' as const };
      }
      await api.updateVote(channel.id, proposalId, myVote.id, { voteType });
      return { action: 'update' as const, voteId: myVote.id, voteType };
    },
    onSuccess: (result) => {
      const applyUpdate = (cacheKey: [string, string]) => {
        queryClient.setQueryData<{
          pages: { feed: FeedItemRes[] }[];
          pageParams: number[];
        }>(cacheKey, (oldData) => {
          if (!oldData) {
            return oldData;
          }
          const pages = oldData.pages.map((page) => {
            const feed = page.feed.map((item) => {
              if (item.type !== 'proposal' || item.id !== proposalId) {
                return item;
              }
              if (result.action === 'delete') {
                return {
                  ...item,
                  myVote: undefined,
                };
              }
              return {
                ...item,
                myVote: {
                  id: result.voteId,
                  voteType: result.voteType,
                },
              };
            });
            return { feed };
          });
          return { pages, pageParams: oldData.pageParams };
        });
      };

      if (channel.name === GENERAL_CHANNEL_NAME) {
        applyUpdate(['feed', GENERAL_CHANNEL_NAME]);
      }
      applyUpdate(['feed', channel.id]);

      toast(t('votes.prompts.voteCast'));
    },
    onError: () => {
      toast(t('errors.somethingWentWrong'));
    },
  });

  return (
    <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-4">
      {VOTE_TYPES.map((vote) => (
        <Button
          key={vote}
          variant="outline"
          size="sm"
          className={cn(
            'col-span-1',
            myVote?.voteType === vote && '!bg-primary/15',
          )}
          onClick={() => castVote(vote)}
          disabled={isPending}
        >
          {t(`proposals.actions.${vote}`)}
        </Button>
      ))}
    </div>
  );
};
