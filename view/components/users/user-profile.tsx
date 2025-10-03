import { CurrentUser } from '@/types/user.types';
import { useTranslation } from 'react-i18next';
import { truncate } from '../../lib/text.utils';
import { LazyLoadImage } from '../images/lazy-load-image';
import { UserAvatar } from './user-avatar';

interface Props {
  user: CurrentUser;
}

export const UserProfile = ({ user }: Props) => {
  const { t } = useTranslation();

  const name = user.displayName || user.name;
  const truncatedUsername = truncate(name, 18);

  return (
    <div className="flex flex-col gap-4 md:min-w-lg">
      <div className="relative">
        {user.coverPhoto?.url ? (
          <LazyLoadImage
            src={user.coverPhoto.url}
            alt={t('users.form.coverPhoto')}
            className="h-32 w-full rounded-lg object-cover"
            skipAnimation={true}
          />
        ) : (
          <div className="bg-muted flex h-32 w-full items-center justify-center rounded-lg">
            <span className="text-muted-foreground text-sm">
              {t('users.placeholders.coverPhoto')}
            </span>
          </div>
        )}
      </div>

      <div className="-mt-12 flex flex-col items-center gap-3">
        <UserAvatar
          name={user.name}
          userId={user.id}
          imageSrc={user.profilePicture?.url}
          className="border-background size-24 border-4"
          fallbackClassName="text-xl"
        />

        <div className="flex flex-col items-center gap-1">
          <h2 className="text-xl font-semibold">{truncatedUsername}</h2>
          <p className="text-muted-foreground text-sm">@{user.name}</p>
        </div>

        {user.bio && (
          <p className="text-foreground text-center text-sm whitespace-pre-wrap">
            {user.bio}
          </p>
        )}
      </div>
    </div>
  );
};
