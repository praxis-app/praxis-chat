import { api } from '@/client/api-client';
import { Button } from '@/components/ui/button';
import { useAuthData } from '@/hooks/use-auth-data';
import { useServerData } from '@/hooks/use-server-data';
import { handleError } from '@/lib/error.utils';
import { cn } from '@/lib/shared.utils';
import { ChannelRes, FeedItemRes } from '@/types/channel.types';
import { VoteRes } from '@/types/vote.types';
import { PollStage } from '@common/polls/poll.types';
import { VOTE_TYPES } from '@common/votes/vote.constants';
import { VoteType } from '@common/votes/vote.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface Props {
  channel: ChannelRes;
  myVote?: VoteRes;
  pollId: string;
  stage: PollStage;
}

export const ProposalVoteButtons = ({
  channel,
  pollId,
  myVote,
  stage,
}: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { serverId } = useServerData();
  const { isLoggedIn } = useAuthData();

  const { mutate: castVote, isPending } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      // Create vote
      if (!myVote) {
        const { vote } = await api.createVote(serverId, channel.id, pollId, {
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
        await api.deleteVote(serverId, channel.id, pollId, myVote.id);
        return {
          action: 'delete' as const,
          isRatifyingVote: false,
          voteId: myVote.id,
        };
      }
      // Update vote
      const { isRatifyingVote } = await api.updateVote(
        serverId,
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
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      queryClient.setQueryData<{
        pages: { feed: FeedItemRes[] }[];
        pageParams: number[];
      }>(['servers', serverId, 'channels', channel.id, 'feed'], (oldData) => {
        if (!oldData) {
          return oldData;
        }
        const pages = oldData.pages.map((page) => {
          const feed = page.feed.map((item) => {
            if (
              item.id !== pollId ||
              item.type !== 'poll' ||
              item.pollType !== 'proposal'
            ) {
              return item;
            }

            let agreementVoteCount = item.agreementVoteCount;
            let votes: VoteRes[] = item.votes ? [...item.votes] : [];

            if (result.action === 'delete') {
              if (myVote?.voteType === 'agree') {
                agreementVoteCount -= 1;
              }
              votes = votes.filter((vote) => vote.id !== result.voteId);
              return {
                ...item,
                votes,
                agreementVoteCount,
                myVote: undefined,
              };
            }

            if (result.action === 'create') {
              if (result.voteType === 'agree') {
                agreementVoteCount += 1;
              }
              votes.push({ id: result.voteId, voteType: result.voteType! });
            }

            if (result.action === 'update') {
              if (myVote?.voteType !== 'agree' && result.voteType === 'agree') {
                agreementVoteCount += 1;
              }
              if (myVote?.voteType === 'agree' && result.voteType !== 'agree') {
                agreementVoteCount -= 1;
              }
              votes = votes.map((vote) =>
                vote.id === result.voteId
                  ? { ...vote, voteType: result.voteType! }
                  : vote,
              );
            }

            return {
              ...item,
              votes,
              agreementVoteCount,
              stage: result.isRatifyingVote ? 'ratified' : item.stage,
              myVote: { id: result.voteId, voteType: result.voteType! },
            };
          });
          return { feed };
        });
        return { pages, pageParams: oldData.pageParams };
      });

      if (result.isRatifyingVote) {
        toast(t('proposals.prompts.ratifiedSuccess'));
      }
    },
    onError(error: Error) {
      handleError(error);
    },
  });

  const handleVoteBtnClick = (voteType: VoteType) => {
    if (!isLoggedIn) {
      toast(t('proposals.prompts.signInToVote'));
      return;
    }
    if (stage === 'closed') {
      toast(t('proposals.prompts.noVotingAfterClose'));
      return;
    }
    if (stage === 'ratified') {
      toast(t('proposals.prompts.noVotingAfterRatification'));
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
            myVote?.voteType === vote && 'bg-primary/15!',
          )}
          onClick={() => handleVoteBtnClick(vote)}
          disabled={isPending}
        >
          {t(`proposals.actions.${vote}`)}
        </Button>
      ))}
    </div>
  );
};
