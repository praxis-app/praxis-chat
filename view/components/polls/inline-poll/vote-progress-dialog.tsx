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

  const totalVotes = votes.length;

  const { agreements, disagreements } = useMemo(
    () => sortConsensusVotesByType(votes),
    [votes],
  );

  const quorumProgress = useMemo(() => {
    if (!config.quorumEnabled) {
      return null;
    }
    const requiredQuorum = Math.ceil(
      memberCount * (config.quorumThreshold * 0.01),
    );
    const percentage =
      requiredQuorum > 0
        ? Math.min(100, Math.round((totalVotes / requiredQuorum) * 100))
        : 100;
    return {
      current: totalVotes,
      required: requiredQuorum,
      total: memberCount,
      threshold: config.quorumThreshold,
      percentage,
      met: totalVotes >= requiredQuorum,
    };
  }, [config, totalVotes, memberCount]);

  const thresholdProgress = useMemo(() => {
    const participantVotes = agreements.length + disagreements.length;
    const requiredThreshold =
      participantVotes > 0
        ? Math.ceil(participantVotes * (config.ratificationThreshold * 0.01))
        : 0;
    const percentage =
      participantVotes > 0
        ? Math.min(
            100,
            Math.round((agreements.length / participantVotes) * 100),
          )
        : 0;
    return {
      current: agreements.length,
      required: requiredThreshold,
      total: participantVotes,
      threshold: config.ratificationThreshold,
      percentage,
      met: agreements.length >= requiredThreshold && participantVotes > 0,
    };
  }, [agreements, disagreements, config]);

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
          {quorumProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {t('polls.labels.quorumProgress')}
                </span>
                <span
                  className={
                    quorumProgress.met
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                  }
                >
                  {quorumProgress.met
                    ? t('polls.labels.quorumMet')
                    : t('polls.labels.quorumNotMet')}
                </span>
              </div>
              <Progress value={quorumProgress.percentage} />
              <p className="text-muted-foreground text-sm">
                {t('polls.descriptions.quorumStatus', {
                  current: quorumProgress.current,
                  total: quorumProgress.total,
                  required: quorumProgress.required,
                  threshold: quorumProgress.threshold,
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
                  thresholdProgress.met
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-muted-foreground'
                }
              >
                {thresholdProgress.met
                  ? t('polls.labels.thresholdMet')
                  : t('polls.labels.thresholdNotMet')}
              </span>
            </div>
            <Progress value={thresholdProgress.percentage} />
            <p className="text-muted-foreground text-sm">
              {t('polls.descriptions.thresholdStatus', {
                current: thresholdProgress.current,
                total: thresholdProgress.total,
                required: thresholdProgress.required,
                threshold: thresholdProgress.threshold,
              })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
