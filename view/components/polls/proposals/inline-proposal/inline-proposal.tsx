import { VoteProgressDialog } from '@/components/polls/proposals/inline-proposal/vote-progress-dialog';
import { ProposalAction } from '@/components/polls/proposals/proposal-actions/proposal-action';
import { ProposalVoteButtons } from '@/components/polls/proposals/proposal-vote-buttons';
import { FormattedText } from '@/components/shared/formatted-text';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/users/user-avatar';
import { UserProfileDrawer } from '@/components/users/user-profile-drawer';
import { truncate } from '@/lib/text.utils';
import { timeAgo, timeFromNow } from '@/lib/time.utils';
import { ChannelRes } from '@/types/channel.types';
import { PollRes } from '@/types/poll.types';
import { CurrentUser } from '@/types/user.types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaClipboard } from 'react-icons/fa';

interface Props {
  poll: PollRes;
  channel: ChannelRes;
  me?: CurrentUser;
}

export const InlineProposal = ({ poll, channel, me }: Props) => {
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
            {t('proposals.labels.consensusProposal')}
          </div>

          {body && <FormattedText text={body} className="pt-1 pb-2" />}

          {action && <ProposalAction action={action} />}

          <CardAction className="flex w-full flex-wrap gap-2">
            <ProposalVoteButtons
              pollId={id}
              channel={channel}
              myVote={myVote}
              stage={stage}
            />
          </CardAction>

          <Separator className="my-1" />

          <div className="flex justify-between">
            <div className="text-muted-foreground flex gap-3 text-sm">
              <VoteProgressDialog
                votes={votes ?? []}
                config={config}
                memberCount={memberCount}
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
              />
              <div className="flex items-center">
                {config?.closingAt ? (
                  timeFromNow(config.closingAt, true)
                ) : (
                  <span className="text-lg">{t('time.infinity')}</span>
                )}
              </div>
            </div>
            <Badge variant="outline">{t(`proposals.labels.${stage}`)}</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};
