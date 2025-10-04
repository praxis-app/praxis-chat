import { AttachedImageList } from '@/components/images/attached-image-list';
import { FormattedText } from '@/components/shared/formatted-text';
import { UserAvatar } from '@/components/users/user-avatar';
import { UserProfile } from '@/components/users/user-profile';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { timeAgo } from '@/lib/time.utils';
import { MessageRes } from '@/types/message.types';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useTranslation } from 'react-i18next';
import { truncate } from '../../lib/text.utils';
import { CurrentUser } from '../../types/user.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface Props {
  message: MessageRes;
  me?: CurrentUser;
}

export const Message = ({
  message: { body, images, user, createdAt },
  me,
}: Props) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const formattedDate = timeAgo(createdAt);
  const showImages = !!images?.length;

  const name = user.displayName || user.name;
  const truncatedUsername = truncate(name, 18);

  return (
    <Dialog>
      <div className="flex gap-4">
        <DialogTrigger asChild>
          <button className="flex-shrink-0 cursor-pointer">
            <UserAvatar
              name={name}
              userId={user.id}
              className="mt-0.5"
              imageId={user.profilePictureId}
            />
          </button>
        </DialogTrigger>

        <div>
          <div className="mb-[-0.1rem] flex items-center gap-1.5">
            <DialogTrigger asChild>
              <button className="cursor-pointer font-medium">
                {truncatedUsername}
              </button>
            </DialogTrigger>
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

      <DialogContent className="p-0">
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>{truncatedUsername}</DialogTitle>
            <DialogDescription>
              {t('users.prompts.viewProfile', { name: truncatedUsername })}
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden>
        <UserProfile userId={user.id} me={me} />
      </DialogContent>
    </Dialog>
  );
};
