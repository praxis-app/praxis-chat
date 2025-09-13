import { api } from '@/client/api-client';
import { GENERAL_CHANNEL_NAME } from '@/constants/channel.constants';
import { VOTE_TYPE } from '@/constants/proposal.constants';
import { cn } from '@/lib/shared.utils';
import { ChannelRes, FeedItemRes } from '@/types/channel.types';
import { VoteType } from '@/types/vote.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface Props {
  channel: ChannelRes;
  myVoteId?: string;
  myVoteType?: VoteType;
  proposalId: string;
}

export const ProposalVoteButtons = ({
  channel,
  proposalId,
  myVoteId,
  myVoteType,
}: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutate: castVote, isPending } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      if (!myVoteId) {
        const { vote } = await api.createVote(channel.id, proposalId, {
          voteType,
        });
        return { action: 'create' as const, voteId: vote.id, voteType };
      }
      if (myVoteType === voteType) {
        await api.deleteVote(channel.id, proposalId, myVoteId);
        return { action: 'delete' as const };
      }
      await api.updateVote(channel.id, proposalId, myVoteId, { voteType });
      return { action: 'update' as const, voteId: myVoteId, voteType };
    },
    onSuccess: (result) => {
      const applyUpdate = (cacheKey: [string, string | undefined]) => {
        queryClient.setQueryData(
          cacheKey,
          (
            oldData:
              | { pages: { feed: FeedItemRes[] }[]; pageParams: number[] }
              | undefined,
          ) => {
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
                    myVoteId: undefined,
                    myVoteType: undefined,
                  };
                }
                return {
                  ...item,
                  myVoteId: result.voteId,
                  myVoteType: result.voteType,
                };
              });
              return { feed };
            });
            return { pages, pageParams: oldData.pageParams };
          },
        );
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
    <div className="flex w-full flex-wrap gap-2">
      {VOTE_TYPE.map((vote) => (
        <Button
          key={vote}
          variant="outline"
          size="sm"
          className={cn('flex-1', myVoteType === vote && '!bg-primary/15')}
          onClick={() => castVote(vote)}
          disabled={isPending}
        >
          {t(`proposals.actions.${vote}`)}
        </Button>
      ))}
    </div>
  );
};
