import { api } from '@/client/api-client';
import { MIDDOT_WITH_SPACES } from '@/constants/shared.constants';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useServerData } from '@/hooks/use-server-data';
import { cn } from '@/lib/shared.utils';
import { PollOptionRes, PollRes } from '@/types/poll.types';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '../users/user-avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Props {
  poll: PollRes;
  channelId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PollVoteBreakdown = ({
  poll,
  channelId,
  open,
  onOpenChange,
}: Props) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const { serverId } = useServerData();

  const { body, options, votes, config } = poll;
  const isMultipleChoice = config?.multipleChoice ?? false;
  const totalVotes = votes?.length ?? 0;

  const defaultTab = options?.[0]?.id ?? '';
  const [activeTab, setActiveTab] = useState(defaultTab);

  const { data: votersData } = useQuery({
    queryKey: [
      'pollOptionVoters',
      serverId,
      channelId,
      poll.id,
      activeTab,
    ],
    queryFn: () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.getVotersByPollOption(serverId, channelId, poll.id, activeTab);
    },
    enabled: open && !!activeTab && !!serverId,
  });

  const getVotePercentage = (option: PollOptionRes) => {
    const totalOptionSelections =
      options?.reduce((sum, opt) => sum + opt.voteCount, 0) ?? 0;

    const voteDenominator = isMultipleChoice
      ? totalOptionSelections
      : totalVotes;

    return voteDenominator > 0
      ? Math.round((option.voteCount / voteDenominator) * 100)
      : 0;
  };

  const voters = votersData?.voters ?? [];

  const content = (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
      <TabsList className="w-full">
        {options?.map((option) => (
          <TabsTrigger key={option.id} value={option.id}>
            {option.text}
          </TabsTrigger>
        ))}
      </TabsList>

      {options?.map((option) => {
        const percentage = getVotePercentage(option);
        return (
          <TabsContent key={option.id} value={option.id} className="pt-2">
            <div className="text-muted-foreground mb-2 text-sm">
              <span className="font-medium">{percentage}%</span>
              {MIDDOT_WITH_SPACES}
              {t('polls.labels.totalVotes', { count: option.voteCount })}
            </div>
            <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
              <div
                className={cn(
                  'bg-primary/15 h-full rounded-full transition-all duration-500 ease-out',
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {voters.length > 0 ? (
              <div className="mt-3 space-y-2">
                {voters.map((voter) => (
                  <div key={voter.id} className="flex items-center gap-2">
                    <UserAvatar
                      name={voter.displayName || voter.name}
                      userId={voter.id}
                      imageId={voter.profilePicture?.id}
                    />
                    <span className="text-sm">
                      {voter.displayName || voter.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground mt-3 text-sm">
                {t('polls.labels.noVotesYet')}
              </p>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('polls.headers.voteBreakdown')}</DialogTitle>
            <VisuallyHidden>
              <DialogDescription>
                {t('polls.headers.voteBreakdown')}
              </DialogDescription>
            </VisuallyHidden>
          </DialogHeader>
          {body && <p className="text-muted-foreground text-sm">{body}</p>}
          <p className="text-muted-foreground text-xs">
            {t('polls.labels.totalVotes', { count: totalVotes })}
          </p>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="min-h-[calc(100%-4.2rem)] px-4 pb-6">
        <DrawerHeader className="pt-5 pb-2">
          <DrawerTitle>{t('polls.headers.voteBreakdown')}</DrawerTitle>
        </DrawerHeader>
        {body && <p className="text-muted-foreground text-sm">{body}</p>}
        <p className="text-muted-foreground text-xs">
          {t('polls.labels.totalVotes', { count: totalVotes })}
        </p>
        {content}
      </DrawerContent>
    </Drawer>
  );
};
