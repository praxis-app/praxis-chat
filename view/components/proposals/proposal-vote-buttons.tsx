import { api } from '@/client/api-client';
import { VOTE_TYPE } from '@/constants/proposal.constants';
import { cn } from '@/lib/shared.utils';
import { VoteType } from '@/types/proposal.types';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface Props {
  channelId: string;
  myVoteId?: string;
  myVoteType?: VoteType;
  proposalId: string;
}

export const ProposalVoteButtons = ({
  proposalId,
  channelId,
  myVoteId: initialMyVoteId,
  myVoteType: initialMyVoteType,
}: Props) => {
  const { t } = useTranslation();

  const [myVoteId, setMyVoteId] = useState<string | undefined>(initialMyVoteId);
  const [myVoteType, setMyVoteType] = useState<VoteType | undefined>(
    initialMyVoteType,
  );

  useEffect(() => {
    setMyVoteId(initialMyVoteId);
    setMyVoteType(initialMyVoteType);
  }, [initialMyVoteId, initialMyVoteType]);

  const { mutate: castVote, isPending } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      if (!myVoteId) {
        const { vote } = await api.createVote(channelId, proposalId, {
          voteType,
        });
        return { action: 'create' as const, voteId: vote.id, voteType };
      }
      if (myVoteType === voteType) {
        await api.deleteVote(channelId, proposalId, myVoteId);
        return { action: 'delete' as const };
      }
      await api.updateVote(channelId, proposalId, myVoteId, { voteType });
      return { action: 'update' as const, voteId: myVoteId, voteType };
    },
    onSuccess: (result) => {
      if (result.action === 'create') {
        setMyVoteId(result.voteId);
        setMyVoteType(result.voteType);
      } else if (result.action === 'delete') {
        setMyVoteId(undefined);
        setMyVoteType(undefined);
      } else if (result.action === 'update') {
        setMyVoteId(result.voteId);
        setMyVoteType(result.voteType);
      }
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
