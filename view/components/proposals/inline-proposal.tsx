import { timeAgo } from '@/lib/time.utils';
import { ChannelRes } from '@/types/channel.types';
import { ProposalRes } from '@/types/proposal.types';
import { useTranslation } from 'react-i18next';
import { FaClipboard } from 'react-icons/fa';
import { FormattedText } from '../shared/formatted-text';
import { Badge } from '../ui/badge';
import { Card, CardAction } from '../ui/card';
import { Separator } from '../ui/separator';
import { UserAvatar } from '../users/user-avatar';
import { ProposalVoteButtons } from './proposal-vote-buttons';
import { ProposalAction } from './proposal-actions/proposal-action';

interface InlineProposalProps {
  proposal: ProposalRes;
  channel: ChannelRes;
}

export const InlineProposal = ({ proposal, channel }: InlineProposalProps) => {
  const { t } = useTranslation();

  const { body, user, createdAt, id, myVoteId, myVoteType, action } = proposal;
  const name = user?.name ?? '';
  const userId = user?.id ?? '';
  const formattedDate = timeAgo(createdAt ?? '');

  return (
    <div className="flex gap-4 pt-4">
      <UserAvatar name={name} userId={userId} className="mt-0.5" />

      <div className="w-full">
        <div className="flex items-center gap-1.5 pb-1">
          <div className="font-medium">{name}</div>
          <div className="text-muted-foreground text-sm">{formattedDate}</div>
        </div>

        <Card className="before:border-l-border relative w-full gap-3.5 rounded-md px-3 py-3.5 before:absolute before:top-0 before:bottom-0 before:left-0 before:mt-[-0.025rem] before:mb-[-0.025rem] before:w-3 before:rounded-l-md before:border-l-3">
          <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
            <FaClipboard className="mb-0.5" />
            {t('proposals.labels.consensusProposal')}
          </div>

          {body && <FormattedText text={body} className="pt-1 pb-2" />}

          {action && <ProposalAction action={action} />}

          <CardAction className="flex flex-wrap gap-2">
            <ProposalVoteButtons
              proposalId={id}
              channel={channel}
              myVoteId={myVoteId}
              myVoteType={myVoteType}
            />
          </CardAction>

          <Separator className="my-1" />

          {/* TODO: Replace with actual proposal data */}
          <div className="flex justify-between">
            <div className="text-muted-foreground flex gap-3.5 text-sm">
              <div>10/12 voted</div>
              <div>Ends in 2 days</div>
            </div>
            <Badge variant="outline">{t('proposals.labels.active')}</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
};
