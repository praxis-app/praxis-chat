import { api } from '@/client/api-client';
import { cn } from '@/lib/shared.utils';
import { ChannelRes, FeedItemRes } from '@/types/channel.types';
import { GENERAL_CHANNEL_NAME } from '@common/channels/channel.constants';
import { PollStage } from '@common/polls/poll.types';
import { VOTE_TYPES } from '@common/votes/vote.constants';
import { VoteType } from '@common/votes/vote.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { handleError } from '../../lib/error.utils';
import { Button } from '../ui/button';

interface Props {
  channel: ChannelRes;
  myVote?: { id: string; voteType: VoteType };
  pollId: string;
  stage: PollStage;
}

export const PollVoteButtons = ({ channel, pollId, myVote, stage }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { mutate: castVote, isPending } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      // Create vote
      if (!myVote) {
        const { vote } = await api.createVote(channel.id, pollId, {
          voteType,
        });
        return {
          action: 'create' as const,
          isRatifyingVote: vote.isRatifyingVote,
          voteId: vote.id,
          voteType,
        };
      }
      // Delete vote
      if (myVote.voteType === voteType) {
        await api.deleteVote(channel.id, pollId, myVote.id);
        return {
          action: 'delete' as const,
          isRatifyingVote: false,
          voteId: myVote.id,
        };
      }
      // Update vote
      const { isRatifyingVote } = await api.updateVote(
        channel.id,
        pollId,
        myVote.id,
        { voteType },
      );
      return {
        action: 'update' as const,
        isRatifyingVote,
        voteId: myVote.id,
        voteType,
      };
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
              if (item.type !== 'poll' || item.id !== pollId) {
                return item;
              }

              let agreementVoteCount = item.agreementVoteCount;
              if (result.action === 'delete') {
                if (myVote?.voteType === 'agree') {
                  agreementVoteCount -= 1;
                }
                return {
                  ...item,
                  agreementVoteCount,
                  myVote: undefined,
                };
              }

              if (result.action === 'create' && result.voteType === 'agree') {
                agreementVoteCount += 1;
              }
              if (result.action === 'update') {
                if (
                  myVote?.voteType !== 'agree' &&
                  result.voteType === 'agree'
                ) {
                  agreementVoteCount += 1;
                }
                if (
                  myVote?.voteType === 'agree' &&
                  result.voteType !== 'agree'
                ) {
                  agreementVoteCount -= 1;
                }
              }
              return {
                ...item,
                agreementVoteCount,
                stage: result.isRatifyingVote ? 'ratified' : item.stage,
                myVote: { id: result.voteId, voteType: result.voteType },
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

      if (result.isRatifyingVote) {
        toast(t('polls.prompts.ratifiedSuccess'));
      }
    },
    onError(error: Error) {
      handleError(error);
    },
  });

  const handleVoteBtnClick = (voteType: VoteType) => {
    if (stage === 'closed') {
      toast(t('polls.prompts.noVotingAfterClose'));
      return;
    }
    if (stage === 'ratified') {
      toast(t('polls.prompts.noVotingAfterRatification'));
      return;
    }
    castVote(voteType);
  };

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
          onClick={() => handleVoteBtnClick(vote)}
          disabled={isPending}
        >
          {t(`polls.actions.${vote}`)}
        </Button>
      ))}
    </div>
  );
};
