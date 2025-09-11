import {
  BrowserEvents,
  KeyCodes,
  MIDDOT_WITH_SPACES,
} from '@/constants/shared.constants';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { truncate } from '@/lib/text.utils';
import { useAppStore } from '@/store/app.store';
import { Channel } from '@/types/channel.types';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LuArrowLeft } from 'react-icons/lu';
import { MdChevronRight, MdSearch, MdTag } from 'react-icons/md';
import { toast } from 'sonner';
import { NavSheet } from '../nav/nav-sheet';
import { Button } from '../ui/button';
import { ChannelDetailsDialogDesktop } from './channel-details-dialog-desktop';
import { ChannelDetailsDrawer } from './channel-details-drawer';

interface Props {
  channel?: Channel;
}

export const ChannelTopNav = ({ channel }: Props) => {
  const { isNavSheetOpen, setIsNavSheetOpen, isAppLoading } = useAppStore();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const description = channel?.description ?? '';
  const truncatedDescription = truncate(description, 50);

  const truncatedChannelName = truncate(
    channel?.name ?? '',
    isDesktop ? 23 : 25,
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === KeyCodes.Escape) {
        if (isNavSheetOpen) {
          setIsNavSheetOpen(false);
        } else {
          setIsNavSheetOpen(true);
        }
      }
    };
    window.addEventListener(BrowserEvents.Keydown, handleKeyDown);
    return () => {
      window.removeEventListener(BrowserEvents.Keydown, handleKeyDown);
    };
  }, [isNavSheetOpen, setIsNavSheetOpen]);

  return (
    <header className="flex h-[55px] items-center justify-between border-b border-[--color-border] px-2 md:pl-6">
      <div className="mr-1 flex flex-1 items-center gap-2.5">
        {!isDesktop && !isAppLoading && (
          <NavSheet
            trigger={
              <Button variant="ghost" size="icon">
                <LuArrowLeft className="size-6" />
              </Button>
            }
          />
        )}

        <div className="flex gap-2.5">
          {channel && (
            <ChannelDetailsDrawer
              channel={channel}
              trigger={
                <div className="flex flex-1 items-center text-[15px] font-medium select-none">
                  <MdTag className="text-muted-foreground m-1 mr-[0.3rem] size-5" />
                  <div className="tracking-[0.015rem]">
                    {truncatedChannelName}
                  </div>
                  {!isDesktop && (
                    <MdChevronRight className="text-muted-foreground mt-[0.07rem] size-5" />
                  )}
                </div>
              }
            />
          )}

          {!!channel?.description && isDesktop && (
            <div className="text-muted-foreground/75 flex items-center gap-2.5 font-medium">
              <div className="text-muted-foreground/30 text-xl select-none">
                {MIDDOT_WITH_SPACES}
              </div>

              <ChannelDetailsDialogDesktop
                channel={channel}
                trigger={
                  <div className="cursor-pointer text-sm select-none">
                    {truncatedDescription}
                  </div>
                }
              />
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={() => toast(t('prompts.inDev'))}
        variant="ghost"
        size="icon"
      >
        <MdSearch className="size-6" />
      </Button>
    </header>
  );
};
