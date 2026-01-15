import { timeAgo, timeFromNow } from '@/lib/time.utils';
import { ChannelRes } from '@/types/channel.types';
import { PollRes } from '@/types/poll.types';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaClipboard } from 'react-icons/fa';
import { MdHowToVote } from 'react-icons/md';
import { truncate } from '../../lib/text.utils';
import { CurrentUser } from '../../types/user.types';
import { FormattedText } from '../shared/formatted-text';
import { Badge } from '../ui/badge';
import { Card, CardAction } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { UserAvatar } from '../users/user-avatar';
import { UserProfileDrawer } from '../users/user-profile-drawer';
import { PollAction } from './poll-actions/poll-action';
import { PollVoteButtons } from './poll-vote-buttons';

interface Props {
  poll: PollRes;
  channel: ChannelRes;
  me?: CurrentUser;
}

export const InlinePoll = ({ poll, channel, me }: Props) => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    id,
    body,
    user,
    myVote,
    config,
    action,
    stage,
    votes,
    createdAt,
    memberCount,
  } = poll;

  const totalVotes = votes?.length ?? 0;

  const voteStats = useMemo(() => {
    if (!votes || votes.length === 0) {
      return { yesVotes: 0, noVotes: 0, abstains: 0, blocks: 0 };
    }
    return votes.reduce(
      (counts, vote) => {
        if (vote.voteType === 'agree') {
          counts.yesVotes++;
        } else if (vote.voteType === 'disagree') {
          counts.noVotes++;
        } else if (vote.voteType === 'abstain') {
          counts.abstains++;
        } else if (vote.voteType === 'block') {
          counts.blocks++;
        }
        return counts;
      },
      { yesVotes: 0, noVotes: 0, abstains: 0, blocks: 0 },
    );
  }, [votes]);

  const quorumProgress = useMemo(() => {
    if (!config?.quorumEnabled) {
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
    const { yesVotes, noVotes } = voteStats;
    const participantVotes = yesVotes + noVotes;
    const requiredThreshold =
      participantVotes > 0
        ? Math.ceil(participantVotes * (config.ratificationThreshold * 0.01))
        : 0;
    const percentage =
      participantVotes > 0
        ? Math.min(100, Math.round((yesVotes / participantVotes) * 100))
        : 0;
    return {
      current: yesVotes,
      required: requiredThreshold,
      total: participantVotes,
      threshold: config.ratificationThreshold,
      percentage,
      met: yesVotes >= requiredThreshold && participantVotes > 0,
    };
  }, [voteStats, config]);

  const name = user.displayName || user.name;
  const truncatedName = truncate(name, 18);
  const formattedDate = timeAgo(createdAt);

  return (
    <div className="flex gap-4 pt-4">
      <UserProfileDrawer
        name={truncatedName}
        userId={user.id}
        me={me}
        trigger={
          <button className="shrink-0 cursor-pointer self-start">
            <UserAvatar
              name={name}
              userId={user.id}
              imageId={user.profilePicture?.id}
              className="mt-0.5"
            />
          </button>
        }
      />

      <div className="w-full">
        <div className="flex items-center gap-1.5 pb-1">
          <UserProfileDrawer
            name={truncatedName}
            userId={user.id}
            me={me}
            trigger={
              <button className="cursor-pointer font-medium">
                {truncatedName}
              </button>
            }
          />
          <div className="text-muted-foreground text-sm">{formattedDate}</div>
        </div>

        <Card className="before:border-l-border relative w-full gap-3.5 rounded-md px-3 py-3.5 before:absolute before:top-0 before:bottom-0 before:left-0 before:mt-[-0.025rem] before:mb-[-0.025rem] before:w-3 before:rounded-l-md before:border-l-3">
          <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
            <FaClipboard className="mb-0.5" />
            {t('polls.labels.consensusProposal')}
          </div>

          {body && <FormattedText text={body} className="pt-1 pb-2" />}

          {action && <PollAction action={action} />}

          <CardAction className="flex w-full flex-wrap gap-2">
            <PollVoteButtons
              pollId={id}
              channel={channel}
              myVote={myVote}
              stage={stage}
            />
          </CardAction>

          <Separator className="my-1" />

          <div className="flex justify-between">
            <div className="text-muted-foreground flex gap-3 text-sm">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button className="flex cursor-pointer items-center gap-1.5 hover:underline">
                    <MdHowToVote className="text-muted-foreground" />
                    <span>
                      {t('polls.labels.totalVotes', { count: totalVotes })}
                    </span>
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
              <div className="flex items-center">
                {config?.closingAt ? (
                  timeFromNow(config.closingAt, true)
                ) : (
                  <span className="text-lg">{t('time.infinity')}</span>
                )}
              </div>
            </div>
            <Badge variant="outline">{t(`polls.labels.${stage}`)}</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};
