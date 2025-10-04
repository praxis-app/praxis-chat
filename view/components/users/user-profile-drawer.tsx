import { useIsDesktop } from '@/hooks/use-is-desktop';
import { truncate } from '@/lib/text.utils';
import { CurrentUser, UserProfileRes } from '@/types/user.types';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQuery } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../client/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer';
import { UserProfile } from './user-profile';

interface Props {
  trigger: ReactNode;
  user?: CurrentUser;
  userId?: string;
  me?: CurrentUser;
}

export const UserProfileDrawer = ({ trigger, user, userId, me }: Props) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  // TODO: Refactor - this query is used in multiple places
  const { data: profileData } = useQuery({
    queryKey: ['users', userId, 'profile'],
    queryFn: () => api.getUserProfile(userId || ''),
    enabled: !!userId && !user,
  });
  const profileUser: CurrentUser | UserProfileRes | undefined =
    user || profileData?.user;

  if (!profileUser) {
    return trigger;
  }

  const name = profileUser.displayName || profileUser.name;
  const truncatedUsername = truncate(name, 18);

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="p-0">
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>{truncatedUsername}</DialogTitle>
              <DialogDescription>
                {t('users.prompts.viewProfile', { name: truncatedUsername })}
              </DialogDescription>
            </DialogHeader>
          </VisuallyHidden>
          <UserProfile user={user} userId={userId} me={me} />
        </DialogContent>
      </Dialog>
    );
  }

  // TODO: Ensure there's no spacing above cover photo when drawer is open

  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent className="flex min-h-[calc(100%-3.5rem)] w-full flex-col items-start rounded-t-2xl border-0">
        <VisuallyHidden>
          <DrawerHeader>
            <DrawerTitle>{truncatedUsername}</DrawerTitle>
            <DrawerDescription>
              {t('users.prompts.viewProfile', { name: truncatedUsername })}
            </DrawerDescription>
          </DrawerHeader>
        </VisuallyHidden>
        <UserProfile
          user={user}
          userId={userId}
          me={me}
          className="w-full pt-4"
        />
      </DrawerContent>
    </Drawer>
  );
};
