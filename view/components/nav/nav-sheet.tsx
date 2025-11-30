import { api } from '@/client/api-client';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useServerData } from '@/hooks/use-server-data';
import { useAppStore } from '@/store/app.store';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LuChevronRight } from 'react-icons/lu';
import { MdExitToApp, MdPersonAdd, MdTag } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import appIconImg from '../../assets/images/app-icon.png';
import { useGeneralChannel } from '../../hooks/use-general-channel';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { UserAvatar } from '../users/user-avatar';
import { NavDrawer } from './nav-drawer';
import { NavDropdown } from './nav-dropdown';

interface Props {
  trigger: ReactNode;
}

export const NavSheet = ({ trigger }: Props) => {
  const { isLoggedIn, isNavSheetOpen, setIsNavSheetOpen } = useAppStore();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  const { serverId, serverPath } = useServerData();
  const { me, signUpPath, showSignUp, isMeLoading, isRegistered } =
    useAuthData();

  const channelsPath = `${serverPath}${NavigationPaths.Channels}`;

  const { data: channelsData } = useQuery({
    queryKey: ['servers', serverId, 'channels'],
    queryFn: async () => {
      if (!serverId) {
        throw new Error('No current server found');
      }
      return api.getJoinedChannels(serverId);
    },
    enabled: !isDesktop && isRegistered && !!serverId,
  });

  const { data: generalChannelData } = useGeneralChannel({
    enabled: !isMeLoading && !isRegistered,
  });

  const name = me?.displayName || me?.name;

  return (
    <Sheet open={isNavSheetOpen} onOpenChange={setIsNavSheetOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="left"
        className="bg-accent dark:bg-background min-w-[100%] border-r-0 px-0 pt-4"
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton
      >
        <SheetHeader className="space-y-4">
          <SheetTitle className="flex items-center justify-between pr-6">
            <NavDrawer
              trigger={
                <div className="flex cursor-pointer items-center gap-2 self-center px-6 font-medium tracking-[0.02em]">
                  <img
                    src={appIconImg}
                    alt={t('brand')}
                    className="size-9 self-center"
                  />
                  {t('brand')}
                  {isLoggedIn && (
                    <LuChevronRight className="mt-0.5 ml-0.5 size-4" />
                  )}
                </div>
              }
            />
            {me && (
              <NavDropdown
                trigger={
                  <UserAvatar
                    name={name || ''}
                    userId={me.id}
                    imageSrc={me.profilePicture?.url}
                    className="size-9"
                    fallbackClassName="text-[1.05rem]"
                  />
                }
              />
            )}
          </SheetTitle>
          <VisuallyHidden>
            <SheetDescription>
              {t('navigation.descriptions.navSheet')}
            </SheetDescription>
          </VisuallyHidden>
        </SheetHeader>

        <div className="bg-background dark:bg-card flex h-full w-full flex-col gap-6 overflow-y-auto rounded-t-2xl px-4 pt-7 pb-12">
          {channelsData?.channels.map((channel) => (
            <Link
              key={channel.id}
              to={`${channelsPath}/${channel.id}`}
              onClick={() => setIsNavSheetOpen(false)}
              className="flex items-center gap-1.5 font-light tracking-[0.01em]"
            >
              <MdTag className="mr-1 size-6" />
              <div>{channel.name}</div>
            </Link>
          ))}

          {/* Show general channel for unregistered users */}
          {!isRegistered && generalChannelData && (
            <Link
              key={generalChannelData.channel.id}
              to={NavigationPaths.Home}
              onClick={() => setIsNavSheetOpen(false)}
            >
              <div>{generalChannelData.channel.name}</div>
            </Link>
          )}

          {(showSignUp || !isLoggedIn) && (
            <div className="flex flex-col gap-4">
              <Separator />

              {showSignUp && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base font-light"
                  onClick={() => {
                    navigate(signUpPath);
                    setIsNavSheetOpen(false);
                  }}
                >
                  <MdPersonAdd className="mr-1 size-6" />
                  {t('auth.actions.signUp')}
                </Button>
              )}

              {!isLoggedIn && (
                <Button
                  variant="ghost"
                  className="w-full justify-start text-base font-light"
                  onClick={() => {
                    navigate(NavigationPaths.Login);
                    setIsNavSheetOpen(false);
                  }}
                >
                  <MdExitToApp className="mr-1 size-6" />
                  {t('auth.actions.logIn')}
                </Button>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
