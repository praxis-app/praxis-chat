import { timeAgo, timeFromNow } from '@/lib/time.utils';
import { ChannelRes } from '@/types/channel.types';
import { ProposalRes } from '@/types/proposal.types';
import { useTranslation } from 'react-i18next';
import { FaClipboard } from 'react-icons/fa';
import { truncate } from '../../lib/text.utils';
import { CurrentUser } from '../../types/user.types';
import { FormattedText } from '../shared/formatted-text';
import { Badge } from '../ui/badge';
import { Card, CardAction } from '../ui/card';
import { Separator } from '../ui/separator';
import { UserAvatar } from '../users/user-avatar';
import { UserProfileDrawer } from '../users/user-profile-drawer';
import { ProposalAction } from './proposal-actions/proposal-action';
import { ProposalVoteButtons } from './proposal-vote-buttons';

interface Props {
  proposal: ProposalRes;
  channel: ChannelRes;
  me?: CurrentUser;
}

export const InlineProposal = ({ proposal, channel, me }: Props) => {
  const { t } = useTranslation();

  const {
    id,
    body,
    user,
    myVote,
    config,
    action,
    stage,
    votesNeededToRatify,
    agreementVoteCount,
    createdAt,
  } = proposal;

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
          <button className="flex-shrink-0 cursor-pointer self-start">
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
              proposalId={id}
              channel={channel}
              myVote={myVote}
              stage={stage}
            />
          </CardAction>

          <Separator className="my-1" />

          <div className="flex justify-between">
            <div className="text-muted-foreground flex gap-3 text-sm">
              <div className="flex items-center">
                {t('proposals.labels.voteCount', {
                  agreementVoteCount,
                  votesNeededToRatify,
                })}
              </div>
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
