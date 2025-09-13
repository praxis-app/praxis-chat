import { AttachedImageList } from '@/components/images/attached-image-list';
import { FormattedText } from '@/components/shared/formatted-text';
import { UserAvatar } from '@/components/users/user-avatar';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { timeAgo } from '@/lib/time.utils';
import { MessageRes as MessageType } from '@/types/message.types';
import { useTranslation } from 'react-i18next';

interface Props {
  message: MessageType;
}

export const Message = ({
  message: { body, images, user, createdAt },
}: Props) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const formattedDate = timeAgo(createdAt);
  const showImages = !!images?.length;

  return (
    <div className="flex gap-4">
      <UserAvatar name={user.name} userId={user.id} className="mt-0.5" />

      <div>
        <div className="mb-[-0.1rem] flex items-center gap-1.5">
          <div className="font-medium">{user.name}</div>
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
