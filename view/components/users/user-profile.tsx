import { useUserProfileQuery } from '@/hooks/use-user-profile-query';
import { CurrentUser, UserProfileRes } from '@/types/user.types';
import { useTranslation } from 'react-i18next';
import { truncate } from '../../lib/text.utils';
import { LazyLoadImage } from '../images/lazy-load-image';
import { UserAvatar } from './user-avatar';

interface PropsWithUser {
  user: CurrentUser;
  userId?: never;
}

interface PropsWithUserId {
  user?: never;
  userId: string;
}

// TODO: Clean up prop types for this component
type Props = PropsWithUser | PropsWithUserId;

export const UserProfile = (props: Props) => {
  const { t } = useTranslation();

  // Fetch profile data if only userId is provided
  const { data: profileData } = useUserProfileQuery({
    userId: props.userId || '',

    // TODO: Don't fetch profile data if user is provided - make condition more specific
    enabled: !!props.userId,
  });

  // Use provided user or fetched profile
  const user: CurrentUser | UserProfileRes | undefined =
    props.user || profileData?.user;

  if (!user) {
    return null;
  }

  const name = user.displayName || user.name;
  const truncatedUsername = truncate(name, 18);

  const isCurrentUser = (u: CurrentUser | UserProfileRes): u is CurrentUser => {
    return 'permissions' in u;
  };

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
          <div className="bg-muted flex h-32 w-full items-center justify-center">
            <span className="text-muted-foreground text-sm">
              {t('users.placeholders.coverPhoto')}
            </span>
          </div>
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
