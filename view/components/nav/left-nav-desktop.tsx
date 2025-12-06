import appIconImg from '@/assets/images/app-icon.png';
import { ChannelListDesktop } from '@/components/channels/channel-list-desktop';
import {
  CreateChannelForm,
  CreateChannelFormSubmitButton,
} from '@/components/channels/create-channel-form';
import { LeftNavUserMenu } from '@/components/nav/left-nav-user-menu';
import { ServerSwitchDialog } from '@/components/nav/server-switch-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { useAuthData } from '@/hooks/use-auth-data';
import { cn } from '@/lib/shared.utils';
import { useAppStore } from '@/store/app.store';
import { CurrentUserRes } from '@/types/user.types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MdAddCircle,
  MdExpandMore,
  MdOutlineSettings,
  MdSettings,
} from 'react-icons/md';
import { TbSwitchHorizontal } from 'react-icons/tb';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface Props {
  me?: CurrentUserRes;
}

export const LeftNavDesktop = ({ me }: Props) => {
  const { isLoggedIn, isAppLoading } = useAppStore();
  const [showRoomFormDialog, setShowRoomFormDialog] = useState(false);
  const [showServerSwitchDialog, setShowServerSwitchDialog] = useState(false);

  const { t } = useTranslation();
  const { serverSlug } = useParams();
  const { signUpPath } = useAuthData();

  const { serverAbility, instanceAbility } = useAbility();
  const canManageChannels = serverAbility.can('manage', 'Channel');
  const canManageServerSettings = serverAbility.can('manage', 'ServerConfig');

  const isServerMenuBtnDisabled =
    !canManageServerSettings && !canManageChannels && !me?.serversCount;

  const resolvedServerSlug = serverSlug || me?.currentServer?.slug;
  const settingsPath = `/s/${resolvedServerSlug}${NavigationPaths.Settings}`;

  return (
    <div className="dark:bg-card bg-secondary flex h-full w-[240px] flex-col border-r border-[--color-border]">
      <ServerSwitchDialog
        open={showServerSwitchDialog}
        onOpenChange={setShowServerSwitchDialog}
      />
      <Dialog open={showRoomFormDialog} onOpenChange={setShowRoomFormDialog}>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              'flex h-[55px] w-full justify-between border-b border-[--color-border] pr-3 pl-4 select-none focus:outline-none',
              !isServerMenuBtnDisabled &&
                'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 cursor-pointer',
            )}
            disabled={isServerMenuBtnDisabled}
          >
            <div className="flex items-center gap-2">
              <img
                src={appIconImg}
                alt={t('brand')}
                className="size-[1.55rem] self-center"
              />
              <div className="self-center text-base/tight font-medium tracking-[0.02em]">
                {t('brand')}
              </div>
            </div>

            {!isServerMenuBtnDisabled && (
              <MdExpandMore className="size-[1.4rem] self-center" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10} className="w-52">
            {canManageChannels && (
              <DialogTrigger asChild>
                <DropdownMenuItem className="text-md">
                  <MdAddCircle className="text-foreground size-5" />
                  {t('channels.actions.create')}
                </DropdownMenuItem>
              </DialogTrigger>
            )}

            {canManageServerSettings && (
              <Link to={settingsPath}>
                <DropdownMenuItem className="text-md">
                  <MdSettings className="text-foreground size-5" />
                  {t('navigation.labels.serverSettings')}
                </DropdownMenuItem>
              </Link>
            )}

            {instanceAbility.can('manage', 'InstanceConfig') && (
              <Link to={NavigationPaths.Settings}>
                <DropdownMenuItem className="text-md">
                  <MdOutlineSettings className="text-foreground size-5" />
                  {t('navigation.labels.instanceSettings')}
                </DropdownMenuItem>
              </Link>
            )}

            {me && me.serversCount > 1 && (
              <DropdownMenuItem
                className="text-md"
                onSelect={() => setShowServerSwitchDialog(true)}
              >
                <TbSwitchHorizontal className="text-foreground size-5" />
                {t('navigation.labels.switchServers')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('channels.prompts.createChannel')}</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {t('channels.prompts.startConversation')}
          </DialogDescription>

          <CreateChannelForm
            submitButton={(props) => (
              <DialogFooter>
                <CreateChannelFormSubmitButton {...props} />
              </DialogFooter>
            )}
            onSubmit={() => setShowRoomFormDialog(false)}
            className="min-w-[25rem]"
          />
        </DialogContent>
      </Dialog>

      <ChannelListDesktop me={me} />

      <div className="flex h-[60px] items-center justify-between border-t border-[--color-border] px-1.5">
        <LeftNavUserMenu />

        {isLoggedIn ? (
          <Button
            onClick={() => toast(t('prompts.inDev'))}
            variant="ghost"
            size="icon"
          >
            <MdSettings className="text-muted-foreground size-6" />
          </Button>
        ) : (
          <div
            className={cn(
              'flex w-full justify-center gap-2',
              isAppLoading && 'hidden',
            )}
          >
            <Link to={NavigationPaths.Login}>
              <Button variant="ghost">{t('auth.actions.logIn')}</Button>
            </Link>
            <Link to={signUpPath}>
              <Button variant="ghost">{t('auth.actions.signUp')}</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
