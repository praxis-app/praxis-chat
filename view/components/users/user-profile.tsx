import { CurrentUser, UserProfileRes } from '@/types/user.types';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MdEdit } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { api } from '../../client/api-client';
import { NavigationPaths } from '../../constants/shared.constants';
import { cn } from '../../lib/shared.utils';
import { LazyLoadImage } from '../images/lazy-load-image';
import { Button } from '../ui/button';
import { UserAvatar } from './user-avatar';

const isCurrentUserType = (
  user: CurrentUser | UserProfileRes,
): user is CurrentUser => {
  return (
    'permissions' in user &&
    (user.profilePicture === null || 'url' in user.profilePicture) &&
    (user.coverPhoto === null || 'url' in user.coverPhoto)
  );
};

interface Props {
  user?: CurrentUser;
  userId?: string;
  me?: CurrentUser;
  className?: string;
}

export const UserProfile = (props: Props) => {
  const { t } = useTranslation();

  const { data: profileData } = useQuery({
    queryKey: ['users', props.userId, 'profile'],
    queryFn: () => api.getUserProfile(props.userId || ''),
    enabled: !!props.userId && !props.user,
  });
  const user: CurrentUser | UserProfileRes | undefined =
    props.user || profileData?.user;

  if (!user) {
    return null;
  }

  const isMe = props.me?.id === user.id;
  const resolvedName = user.displayName || user.name;

  const profilePictureUrl = isCurrentUserType(user)
    ? user.profilePicture?.url
    : undefined;
  const profilePictureId = !isCurrentUserType(user)
    ? user.profilePicture?.id
    : undefined;
  const coverPhotoUrl = isCurrentUserType(user)
    ? user.coverPhoto?.url
    : undefined;
  const coverPhotoId = !isCurrentUserType(user)
    ? user.coverPhoto?.id
    : undefined;

  return (
    <div className={cn('flex flex-col gap-4 md:min-w-lg', props.className)}>
      <div className="relative">
        {coverPhotoUrl ? (
          <LazyLoadImage
            src={coverPhotoUrl}
            alt={t('users.form.coverPhoto')}
            className="h-32 w-full rounded-t-2xl object-cover md:rounded-t-lg"
            skipAnimation={true}
          />
        ) : coverPhotoId ? (
          <LazyLoadImage
            imageId={coverPhotoId}
            alt={t('users.form.coverPhoto')}
            className="h-32 w-full rounded-t-2xl object-cover md:rounded-t-lg"
            skipAnimation={true}
          />
        ) : (
          <div className="bg-muted flex h-32 w-full rounded-t-2xl md:rounded-t-lg" />
        )}
      </div>

      <div className="-mt-12 flex flex-col gap-3 px-3 pb-6">
        <UserAvatar
          name={user.name}
          userId={user.id}
          imageSrc={profilePictureUrl}
          imageId={profilePictureId}
          className="border-background size-24 border-4"
          fallbackClassName="text-xl"
        />

        <div className="flex flex-col gap-0.5 px-2">
          <h2 className="text-xl font-medium">{resolvedName}</h2>
          <p className="text-muted-foreground text-sm">@{user.name}</p>
        </div>

        {user.bio && (
          <p className="text-foreground px-2 text-sm whitespace-pre-wrap">
            {user.bio}
          </p>
        )}

        {isMe && (
          <Link to={NavigationPaths.UsersEdit} className="mt-2 px-2">
            <Button variant="outline" className="w-full gap-1.5">
              <MdEdit className="size-4" /> {t('users.actions.editProfile')}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};
