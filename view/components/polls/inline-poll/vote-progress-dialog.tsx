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
  getQuorumProgress,
  getAgreementsProgress,
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

  const totalVotes = votes.length;
  const agreementCount = agreements.length;

  const quorumProgress = getQuorumProgress(
    totalVotes,
    memberCount,
    config.quorumThreshold,
  );

  const agreementsProgress = getAgreementsProgress(
    agreementCount,
    memberCount,
    config.ratificationThreshold,
  );

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
                    quorumProgress.isMet
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                  }
                >
                  {quorumProgress.isMet
                    ? t('polls.labels.quorumMet')
                    : t('polls.labels.quorumNotMet')}
                </span>
              </div>
              <Progress value={quorumProgress.percentage} />
              <p className="text-muted-foreground text-sm">
                {t('polls.descriptions.quorumStatus', {
                  current: totalVotes,
                  required: quorumProgress.required,
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
                  agreementsProgress.isMet
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-muted-foreground'
                }
              >
                {agreementsProgress.isMet
                  ? t('polls.labels.thresholdMet')
                  : t('polls.labels.thresholdNotMet')}
              </span>
            </div>
            <Progress value={agreementsProgress.percentage} />
            <p className="text-muted-foreground text-sm">
              {t('polls.descriptions.thresholdStatus', {
                current: agreementCount,
                required: agreementsProgress.required,
                threshold: config.ratificationThreshold,
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
