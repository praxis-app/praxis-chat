import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { PollConfigRes } from '@/types/poll.types';
import { VoteRes } from '@/types/vote.types';
import { sortConsensusVotesByType } from '@common/votes/vote.utils';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MdHowToVote } from 'react-icons/md';

interface Props {
  votes: VoteRes[];
  config: PollConfigRes;
  memberCount: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VoteProgressDialog = ({
  votes,
  config,
  memberCount,
  isOpen,
  onOpenChange,
}: Props) => {
  const { t } = useTranslation();

  const { agreements, disagreements } = useMemo(
    () => sortConsensusVotesByType(votes),
    [votes],
  );

  const totalVotes = votes.length;
  const agreementCount = agreements.length;
  const participantVotes = agreementCount + disagreements.length;

  // Quorum progress
  const quorumEnabled = config.quorumEnabled;
  const requiredQuorum = Math.ceil(
    memberCount * (config.quorumThreshold * 0.01),
  );
  const quorumPercentage =
    requiredQuorum > 0
      ? Math.min(100, Math.round((totalVotes / requiredQuorum) * 100))
      : 100;
  const quorumMet = totalVotes >= requiredQuorum;

  // Threshold progress
  const requiredThreshold =
    participantVotes > 0
      ? Math.ceil(participantVotes * (config.ratificationThreshold * 0.01))
      : 0;
  const thresholdPercentage =
    participantVotes > 0
      ? Math.min(100, Math.round((agreementCount / participantVotes) * 100))
      : 0;
  const thresholdMet = agreementCount >= requiredThreshold && participantVotes > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="flex cursor-pointer items-center gap-1.5 hover:underline">
          <MdHowToVote className="text-muted-foreground" />
          <span>{t('polls.labels.totalVotes', { count: totalVotes })}</span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('polls.headers.voteProgress')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-2">
          {quorumEnabled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {t('polls.labels.quorumProgress')}
                </span>
                <span
                  className={
                    quorumMet
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                  }
                >
                  {quorumMet
                    ? t('polls.labels.quorumMet')
                    : t('polls.labels.quorumNotMet')}
                </span>
              </div>
              <Progress value={quorumPercentage} />
              <p className="text-muted-foreground text-sm">
                {t('polls.descriptions.quorumStatus', {
                  current: totalVotes,
                  total: memberCount,
                  required: requiredQuorum,
                  threshold: config.quorumThreshold,
                })}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {t('polls.labels.thresholdProgress')}
              </span>
              <span
                className={
                  thresholdMet
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-muted-foreground'
                }
              >
                {thresholdMet
                  ? t('polls.labels.thresholdMet')
                  : t('polls.labels.thresholdNotMet')}
              </span>
            </div>
            <Progress value={thresholdPercentage} />
            <p className="text-muted-foreground text-sm">
              {t('polls.descriptions.thresholdStatus', {
                current: agreementCount,
                total: participantVotes,
                required: requiredThreshold,
                threshold: config.ratificationThreshold,
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
