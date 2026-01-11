import { NavigationPaths } from '@/constants/shared.constants';
import { useMeQuery } from '@/hooks/use-me-query';
import { truncate } from '@/lib/text.utils';
import { useAuthSore } from '@/store/auth.store';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdExitToApp, MdPerson } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useLogOut } from '../../hooks/use-log-out';
import { LogOutDialogContent } from '../auth/log-out-dialog-content';
import { Dialog, DialogTrigger } from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { UserAvatar } from '../users/user-avatar';
import { UserProfileDrawer } from '../users/user-profile-drawer';

interface Props {
  trigger: ReactNode;
}

export const NavDropdown = ({ trigger }: Props) => {
  const { isLoggedIn, setIsNavSheetOpen } = useAuthSore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();

  const { mutate: logOut, isPending: isLogoutPending } = useLogOut({
    onSuccess: () => setShowLogoutDialog(false),
  });

  const { data: meData } = useMeQuery({
    enabled: isLoggedIn,
  });

  if (!meData) {
    return null;
  }

  const me = meData.user;
  const name = me.displayName || me.name;
  const truncatedUsername = truncate(name, 22);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        sideOffset={12}
        className="mr-2.5 flex flex-col gap-2 p-3"
      >
        <UserProfileDrawer
          name={truncatedUsername}
          me={me}
          trigger={
            <DropdownMenuItem
              className="text-md"
              onSelect={(e) => e.preventDefault()}
            >
              <UserAvatar
                name={name}
                userId={me.id}
                imageSrc={me.profilePicture?.url}
                className="size-5"
                fallbackClassName="text-[0.7rem]"
              />
              {truncatedUsername}
            </DropdownMenuItem>
          }
        />

        {!me.anonymous && (
          <DropdownMenuItem
            onClick={() => {
              navigate(NavigationPaths.UsersEdit);
              setIsNavSheetOpen(false);
            }}
            className="text-md"
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
