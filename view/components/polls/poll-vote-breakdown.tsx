import { MIDDOT_WITH_SPACES } from '@/constants/shared.constants';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { cn } from '@/lib/shared.utils';
import { PollOptionRes, PollRes } from '@/types/poll.types';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '../ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Props {
  poll: PollRes;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PollVoteBreakdown = ({ poll, open, onOpenChange }: Props) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const { body, options, votes, config } = poll;
  const isMultipleChoice = config?.multipleChoice ?? false;
  const totalVotes = votes?.length ?? 0;

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

  const defaultTab = options?.[0]?.id ?? '';

  const content = (
    <Tabs defaultValue={defaultTab} className="mt-2">
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
          {body && (
            <p className="text-muted-foreground text-sm">{body}</p>
          )}
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
      <DrawerContent className="px-4 pb-6">
        <DrawerHeader className="pt-5 pb-2">
          <DrawerTitle>{t('polls.headers.voteBreakdown')}</DrawerTitle>
        </DrawerHeader>
        {body && (
          <p className="text-muted-foreground text-sm">{body}</p>
        )}
        <p className="text-muted-foreground text-xs">
          {t('polls.labels.totalVotes', { count: totalVotes })}
        </p>
        {content}
      </DrawerContent>
    </Drawer>
  );
};
