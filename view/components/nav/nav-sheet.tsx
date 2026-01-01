import appIconImg from '@/assets/images/app-icon.png';
import { api } from '@/client/api-client';
import { NavDrawer } from '@/components/nav/nav-drawer';
import { NavDropdown } from '@/components/nav/nav-dropdown';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { UserAvatar } from '@/components/users/user-avatar';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { useAuthData } from '@/hooks/use-auth-data';
import { useGeneralChannel } from '@/hooks/use-general-channel';
import { useServerData } from '@/hooks/use-server-data';
import { useAppStore } from '@/store/app.store';
import { INITIAL_SERVER_NAME } from '@common/servers/server.constants';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LuChevronRight } from 'react-icons/lu';
import { MdExitToApp, MdPersonAdd, MdTag } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';

interface Props {
  trigger: ReactNode;
}

export const NavSheet = ({ trigger }: Props) => {
  const { isNavSheetOpen, setIsNavSheetOpen } = useAppStore();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { me, isLoggedIn, signUpPath, showSignUp, isMeSuccess } = useAuthData();

  const { server, serverId, serverPath } = useServerData();
  const { serverAbility } = useAbility();

  const { data: channelsData } = useQuery({
    queryKey: ['servers', serverId, 'channels'],
    queryFn: async () => {
      if (!serverId) {
        throw new Error('No current server found');
      }
      return api.getJoinedChannels(serverId);
    },
    enabled: isNavSheetOpen && isMeSuccess && !!serverId,
  });

  const { data: generalChannelData } = useGeneralChannel({
    enabled: isNavSheetOpen && !me,
  });

  const channelsPath = `${serverPath}/c`;
  const name = me?.displayName || me?.name;

  const canManageChannels = serverAbility.can('manage', 'Channel');
  const canManageServerSettings = serverAbility.can('manage', 'ServerConfig');
  const hasMultipleServers = !!me && me.serversCount > 1;

  const canViewNavDrawer =
    canManageServerSettings || canManageChannels || hasMultipleServers;

  const serverName = server?.name || INITIAL_SERVER_NAME;

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
                    alt={serverName}
                    className="size-9 self-center"
                  />
                  <div className="truncate">{serverName}</div>
                  {canViewNavDrawer && (
                    <LuChevronRight className="mt-0.5 size-4 shrink-0" />
                  )}
                </div>
              }
              disabled={!canViewNavDrawer}
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

          {/* Show general channel for logged out users */}
          {!isLoggedIn && generalChannelData && (
            <Link
              key={generalChannelData.channel.id}
              to={NavigationPaths.Home}
              onClick={() => setIsNavSheetOpen(false)}
              className="flex items-center gap-1.5 font-light tracking-[0.01em]"
            >
              <MdTag className="mr-1 size-6" />
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
