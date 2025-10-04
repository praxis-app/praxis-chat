import { CurrentUser, UserProfileRes } from '@/types/user.types';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { api } from '../../client/api-client';
import { truncate } from '../../lib/text.utils';
import { LazyLoadImage } from '../images/lazy-load-image';
import { UserAvatar } from './user-avatar';

const isCurrentUser = (
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

  const name = user.displayName || user.name;
  const truncatedUsername = truncate(name, 18);

  const profilePictureUrl = isCurrentUser(user)
    ? user.profilePicture?.url
    : undefined;
  const profilePictureId = !isCurrentUser(user)
    ? user.profilePicture?.id
    : undefined;
  const coverPhotoUrl = isCurrentUser(user) ? user.coverPhoto?.url : undefined;
  const coverPhotoId = !isCurrentUser(user) ? user.coverPhoto?.id : undefined;

  return (
    <div className="flex flex-col gap-4 md:min-w-lg">
      <div className="relative">
        {coverPhotoUrl ? (
          <LazyLoadImage
            src={coverPhotoUrl}
            alt={t('users.form.coverPhoto')}
            className="h-32 w-full rounded-b-none object-cover"
            skipAnimation={true}
          />
        ) : coverPhotoId ? (
          <LazyLoadImage
            imageId={coverPhotoId}
            alt={t('users.form.coverPhoto')}
            className="h-32 w-full rounded-b-none object-cover"
            skipAnimation={true}
          />
        ) : (
          <div className="bg-muted flex h-32 w-full" />
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
          <h2 className="text-xl font-medium">{truncatedUsername}</h2>
          <p className="text-muted-foreground text-sm">@{user.name}</p>
        </div>

        {user.bio && (
          <p className="text-foreground px-2 text-sm whitespace-pre-wrap">
            {user.bio}
          </p>
        )}
      </div>
    </div>
  );
};
