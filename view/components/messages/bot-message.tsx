import { cn } from '@/lib/shared.utils';
import { timeAgo } from '@/lib/time.utils';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import appIconImg from '../../assets/images/app-icon.png';
import { UserAvatar } from '../users/user-avatar';
import { MdVisibility } from 'react-icons/md';
import { MIDDOT_WITH_SPACES } from '@/constants/shared.constants';
import { Button } from '../ui/button';

interface Props {
  bodyClassName?: string;
  children: ReactNode;
  currentUserOnly?: boolean;
  onDismiss?: () => void;
  isProcessing?: boolean;
}

export const BotMessage = ({
  children,
  bodyClassName,
  currentUserOnly,
  onDismiss,
  isProcessing = false,
}: Props) => {
  const { t } = useTranslation();
  const formattedDate = timeAgo(Date());

  return (
    <div className="flex gap-4 pt-4">
      <UserAvatar
        name={t('messages.names.praxisBot')}
        imageSrc={appIconImg}
        className="mt-0.5"
      />

      <div>
        <div className="flex items-center gap-1.5">
          <div className="font-medium">{t('messages.names.praxisBot')}</div>
          <div className="text-muted-foreground text-sm font-light">
            {formattedDate}
          </div>
        </div>

        <div className={cn(bodyClassName)}>
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="text-muted-foreground animate-pulse">
                {children}
              </div>
              <div className="flex gap-1">
                <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]"></div>
                <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]"></div>
                <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full"></div>
              </div>
            </div>
          ) : (
            children
          )}
        </div>

        {(currentUserOnly || onDismiss) && (
          <div className="flex items-center gap-1 pt-1">
            {currentUserOnly && (
              <div className="flex items-center gap-1">
                <MdVisibility className="text-muted-foreground text-sm" />
                <div className="text-muted-foreground text-xs">
                  {t('messages.prompts.onlyVisibleToYou')}
                </div>
              </div>
            )}
            {currentUserOnly && onDismiss && (
              <div className="text-muted-foreground px-0.5 text-sm">
                {MIDDOT_WITH_SPACES}
              </div>
            )}
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="link"
                className="text-blurple-2 dark:text-blurple-3 mt-0.5 p-0 text-xs font-normal"
              >
                {t('messages.actions.dismissMessage')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
