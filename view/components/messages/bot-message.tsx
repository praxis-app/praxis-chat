import { MIDDOT_WITH_SPACES } from '@/constants/shared.constants';
import { cn } from '@/lib/shared.utils';
import { timeAgo } from '@/lib/time.utils';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MdVisibility } from 'react-icons/md';
import appIconImg from '../../assets/images/app-icon.png';
import { MessageRes } from '../../types/message.types';
import { FormattedText } from '../shared/formatted-text';
import { Button } from '../ui/button';
import { UserAvatar } from '../users/user-avatar';

interface Props {
  bodyClassName?: string;
  children?: ReactNode;
  currentUserOnly?: boolean;
  onDismiss?: () => void;
  message?: MessageRes;
}

export const BotMessage = ({
  children,
  bodyClassName,
  currentUserOnly,
  onDismiss,
  message,
}: Props) => {
  const { t } = useTranslation();
  const botName =
    message?.bot?.displayName ||
    message?.bot?.name ||
    t('messages.names.praxisBot');
  const formattedDate = timeAgo(message?.createdAt || Date());

  const renderContent = () => {
    if (children) {
      return children;
    }
    if (!message) {
      return null;
    }
    if (message.commandStatus === 'processing') {
      return (
        <div className="text-muted-foreground animate-pulse">
          {t('messages.prompts.processingCommand')}
        </div>
      );
    }
    if (!message.body) {
      return null;
    }
    return <FormattedText text={message.body} />;
  };

  return (
    <div className="flex gap-4">
      <UserAvatar
        name={botName}
        imageSrc={appIconImg}
        className="mt-0.5"
      />

      <div>
        <div className="flex items-center gap-1.5">
          <div className="font-medium">{botName}</div>
          <div className="text-muted-foreground text-sm font-light">
            {formattedDate}
          </div>
        </div>

        <div className={cn(bodyClassName)}>{renderContent()}</div>

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
