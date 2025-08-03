import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { cn } from '@/lib/shared.utils';
import { Channel } from '@/types/channel.types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdSettings, MdTag } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  DeleteChannelForm,
  DeleteChannelFormSubmitButton,
} from './delete-channel-form';

interface Props {
  channel: Channel;
  isActive: boolean;
  isGeneralChannel?: boolean;
}

export const ChannelListItemDesktop = ({
  channel,
  isActive,
  isGeneralChannel,
}: Props) => {
  const [showDeleteChannelDialog, setShowDeleteChannelDialog] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const ability = useAbility();

  const canManageChannels = ability.can('manage', 'Channel');
  const canDeleteChannel = ability.can('delete', 'Channel');
  const showSettingsBtn = canManageChannels && (isHovering || isActive);
  const channelPath = `${NavigationPaths.Channels}/${channel.id}`;
  const settingsPath = `${channelPath}/settings`;

  return (
    <Dialog
      open={showDeleteChannelDialog}
      onOpenChange={setShowDeleteChannelDialog}
    >
      <ContextMenu modal={false}>
        <ContextMenuTrigger>
          <div
            className={cn(
              'text-muted-foreground hover:bg-accent mx-2 flex items-center justify-between rounded-[4px] pr-2.5',
              isActive && 'bg-accent text-foreground',
            )}
            key={channel.id}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <Link
              to={isGeneralChannel ? NavigationPaths.Home : channelPath}
              className="mr-1.5 flex flex-1 items-center gap-2 truncate py-0.5 pl-2.5"
            >
              <MdTag className="size-6" />
              <div className="text-[0.925rem]">{channel.name}</div>
            </Link>
            {showSettingsBtn && (
              <Link to={settingsPath}>
                <MdSettings
                  className={cn(
                    'hover:text-foreground text-muted-foreground size-4.5',
                    isActive && 'text-foreground',
                  )}
                />
              </Link>
            )}
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent>
          {canManageChannels && (
            <ContextMenuItem onClick={() => navigate(settingsPath)}>
              {t('channels.headers.channelSettings')}
            </ContextMenuItem>
          )}

          {canDeleteChannel && (
            <DialogTrigger asChild>
              <ContextMenuItem className="text-destructive">
                {t('channels.actions.delete')}
              </ContextMenuItem>
            </DialogTrigger>
          )}
        </ContextMenuContent>
      </ContextMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('channels.actions.delete')}</DialogTitle>
          <DialogDescription className="pt-3.5">
            {t('prompts.deleteItem', {
              itemType: t('channels.labels.channel'),
            })}
          </DialogDescription>
        </DialogHeader>

        <DeleteChannelForm
          channel={channel}
          submitButton={(props) => (
            <DialogFooter>
              <DeleteChannelFormSubmitButton {...props} />
            </DialogFooter>
          )}
          onSubmit={() => setShowDeleteChannelDialog(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
