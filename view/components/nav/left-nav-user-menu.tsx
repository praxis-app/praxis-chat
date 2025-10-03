import { api } from '@/client/api-client';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { truncate } from '@/lib/text.utils';
import { useAppStore } from '@/store/app.store';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdExitToApp, MdPerson, MdPersonAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { LogOutDialogContent } from '../auth/log-out-dialog-content';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { UserAvatar } from '../users/user-avatar';
import { UserProfile } from '../users/user-profile';

export const LeftNavUserMenu = () => {
  const { setIsLoggedIn } = useAppStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate: logOut, isPending: isLogoutPending } = useMutation({
    mutationFn: api.logOut,
    onSuccess: async () => {
      await navigate(NavigationPaths.Home);
      setShowLogoutDialog(false);
      setIsLoggedIn(false);
      queryClient.clear();
    },
  });

  const { me, signUpPath } = useAuthData();

  if (!me) {
    return null;
  }

  const name = me.displayName || me.name;
  const truncatedUsername = truncate(name, 18);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 mr-1 flex h-11.5 w-full cursor-pointer items-center justify-start gap-2 rounded-[4px] px-2 text-left select-none focus:outline-none"
        title={me.name}
      >
        <UserAvatar
          className="size-8"
          fallbackClassName="text-sm"
          name={name}
          userId={me.id}
          imageSrc={me.profilePicture?.url}
          isOnline={true}
          showOnlineStatus
        />
        <div className="flex flex-col pt-[0.16rem]">
          <div className="text-[0.81rem]/tight">{truncatedUsername}</div>
          <div className="text-muted-foreground text-[0.7rem]/[0.9rem] font-light">
            {t('users.presence.online')}
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-52"
        align="start"
        alignOffset={10}
        side="top"
        sideOffset={18}
      >
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem
              className="text-md"
              onSelect={(e) => e.preventDefault()}
              title={me.name}
            >
              <UserAvatar
                name={me.name}
                userId={me.id}
                imageSrc={me.profilePicture?.url}
                className="size-5"
                fallbackClassName="text-[0.65rem]"
                isOnline={true}
              />
              {truncatedUsername}
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent className="p-0">
            <VisuallyHidden>
              <DialogHeader>
                <DialogTitle>{truncatedUsername}</DialogTitle>
                <DialogDescription>{me.bio}</DialogDescription>
              </DialogHeader>
            </VisuallyHidden>
            <UserProfile user={me} />
          </DialogContent>
        </Dialog>

        {me.anonymous ? (
          <DropdownMenuItem
            className="text-md"
            onClick={() => navigate(signUpPath)}
          >
            <MdPersonAdd className="text-foreground size-5" />
            {t('auth.actions.signUp')}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="text-md"
            onClick={() => navigate(NavigationPaths.UsersEdit)}
          >
            <MdPerson className="text-foreground size-5" />
            {t('users.actions.editProfile')}
          </DropdownMenuItem>
        )}

        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogTrigger asChild>
            <DropdownMenuItem
              className="text-md"
              onSelect={(e) => e.preventDefault()}
            >
              <MdExitToApp className="text-foreground size-5" />
              {t('auth.actions.logOut')}
            </DropdownMenuItem>
          </DialogTrigger>
          <LogOutDialogContent
            handleLogout={logOut}
            isPending={isLogoutPending}
            setShowLogoutDialog={setShowLogoutDialog}
          />
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
