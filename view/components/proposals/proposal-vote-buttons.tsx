import { api } from '@/client/api-client';
import { GENERAL_CHANNEL_NAME } from '@/constants/channel.constants';
import { cn } from '@/lib/shared.utils';
import { ChannelRes, FeedItemRes } from '@/types/channel.types';
import { ProposalStage } from '@common/proposals/proposal.types';
import { VOTE_TYPES } from '@common/votes/vote.constants';
import { VoteType } from '@common/votes/vote.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface Props {
  channel: ChannelRes;
  myVote?: { id: string; voteType: VoteType };
  proposalId: string;
  stage: ProposalStage;
}

export const ProposalVoteButtons = ({
  channel,
  proposalId,
  myVote,
  stage,
}: Props) => {
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
                const agreementVoteCount =
                  myVote?.voteType === 'agree'
                    ? item.agreementVoteCount - 1
                    : item.agreementVoteCount;
                return {
                  ...item,
                  agreementVoteCount,
                  myVote: undefined,
                };
              }

              let agreementVoteCount = item.agreementVoteCount;
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

      toast(t('votes.prompts.voteCast'));
    },
    onError(error: Error) {
      if (error instanceof AxiosError && error.response?.data) {
        toast(error.response?.data);
        return;
      }
      toast(error.message || t('errors.somethingWentWrong'));
    },
  });

  const handleVoteBtnClick = (voteType: VoteType) => {
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
            myVote?.voteType === vote && '!bg-primary/15',
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
