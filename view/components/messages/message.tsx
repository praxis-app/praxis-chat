import { AttachedImageList } from '@/components/images/attached-image-list';
import { FormattedText } from '@/components/shared/formatted-text';
import { UserAvatar } from '@/components/users/user-avatar';
import { UserProfileDrawer } from '@/components/users/user-profile-drawer';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { timeAgo } from '@/lib/time.utils';
import { MessageRes } from '@/types/message.types';
import { useTranslation } from 'react-i18next';
import { truncate } from '../../lib/text.utils';
import { CurrentUser } from '../../types/user.types';

interface Props {
  message: MessageRes;
  me?: CurrentUser;
  channelId?: string;
}

export const Message = ({
  message: { id, body, images, user, createdAt },
  channelId,
  me,
}: Props) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const formattedDate = timeAgo(createdAt);
  const showImages = !!images?.length;

  const name = user.displayName || user.name;
  const truncatedUsername = truncate(name, 18);

  return (
    <div className="flex gap-4">
      <UserProfileDrawer
        name={truncatedUsername}
        userId={user.id}
        me={me}
        trigger={
          <button className="flex-shrink-0 cursor-pointer self-start">
            <UserAvatar
              name={name}
              userId={user.id}
              className="mt-0.5"
              imageId={user.profilePicture?.id}
            />
          </button>
        }
      />

      <div>
        <div className="mb-[-0.1rem] flex items-center gap-1.5">
          <UserProfileDrawer
            name={truncatedUsername}
            userId={user.id}
            me={me}
            trigger={
              <button className="cursor-pointer font-medium">
                {truncatedUsername}
              </button>
            }
          />
          <div className="text-muted-foreground text-sm font-light">
            {formattedDate}
          </div>
        </div>

        {/* TODO: Truncate message body if it exceeds a certain length */}
        {body && <FormattedText text={body} />}

        {/* TODO: Enable navigation between images in modal */}
        {showImages && (
          <AttachedImageList
            images={images}
            channelId={channelId}
            messageId={id}
            imageClassName="rounded-lg"
            className={`pt-1.5 ${isDesktop ? 'w-[350px]' : 'w-full'}`}
          />
        )}

        {!body && !showImages && (
          <div className="text-muted-foreground text-sm">
            {t('prompts.noContent')}
          </div>
        )}
      </div>
    </div>
  );
};
