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
import {
  getProgressPercentage,
  getRequiredCount,
} from '@common/polls/poll.utils';
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

  const { agreements } = useMemo(
    () => sortConsensusVotesByType(votes),
    [votes],
  );

  const { ratificationThreshold, quorumThreshold } = config;
  const agreementCount = agreements.length;
  const totalVotes = votes.length;

  // Agreement progress
  const requiredAgreements = getRequiredCount(
    memberCount,
    ratificationThreshold,
  );
  const agreementsPercentage = getProgressPercentage(
    agreementCount,
    requiredAgreements,
  );
  const isAgreementMet = agreementCount >= requiredAgreements;

  // Quorum progress
  const requiredQuorum = getRequiredCount(memberCount, quorumThreshold);
  const quorumPercentage = getProgressPercentage(totalVotes, requiredQuorum);
  const isQuorumMet = totalVotes >= requiredQuorum;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="flex cursor-pointer items-center gap-1.5 hover:underline">
          <MdHowToVote className="text-muted-foreground" />
          <span>{t('polls.labels.totalVotes', { count: totalVotes })}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="md:w-lg">
        <DialogHeader>
          <DialogTitle>{t('polls.headers.voteProgress')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 pt-2">
          {config.quorumEnabled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {t('polls.labels.quorumProgress')}
                </span>
                <span
                  className={
                    isQuorumMet
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                  }
                >
                  {isQuorumMet
                    ? t('polls.labels.quorumMet')
                    : t('polls.labels.quorumNotMet')}
                </span>
              </div>
              <Progress value={quorumPercentage} />
              <p className="text-muted-foreground text-sm">
                {t('polls.descriptions.quorumStatus', {
                  current: totalVotes,
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
                  isAgreementMet
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-muted-foreground'
                }
              >
                {isAgreementMet
                  ? t('polls.labels.thresholdMet')
                  : t('polls.labels.thresholdNotMet')}
              </span>
            </div>
            <Progress value={agreementsPercentage} />
            <p className="text-muted-foreground text-sm">
              {t('polls.descriptions.thresholdStatus', {
                current: agreementCount,
                required: requiredAgreements,
                threshold: config.ratificationThreshold,
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
