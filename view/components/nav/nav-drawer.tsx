import { NavigationPaths } from '@/constants/shared.constants';
import { useAppStore } from '@/store/app.store';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAddCircle, MdSettings } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { useServerData } from '../../hooks/use-server-data';
import {
  CreateChannelForm,
  CreateChannelFormSubmitButton,
} from '../channels/create-channel-form';
import { Button } from '../ui/button';
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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer';

interface Props {
  trigger: ReactNode;
}

export const NavDrawer = ({ trigger }: Props) => {
  const { isLoggedIn, setIsNavSheetOpen } = useAppStore();
  const [showNavDrawer, setShowNavDrawer] = useState(false);
  const [showRoomFormDialog, setShowRoomFormDialog] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { serverPath } = useServerData();

  return (
    <Drawer open={showNavDrawer} onOpenChange={setShowNavDrawer}>
      {isLoggedIn ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : trigger}

      <DrawerContent className="flex min-h-[calc(100%-68px)] flex-col items-start rounded-t-2xl border-0">
        <VisuallyHidden>
          <DrawerHeader>
            <DrawerTitle>{t('navigation.titles.navDrawer')}</DrawerTitle>
            <DrawerDescription>
              {t('navigation.descriptions.navDrawer')}
            </DrawerDescription>
          </DrawerHeader>
        </VisuallyHidden>

        <div className="flex flex-col gap-4 p-4">
          <Dialog
            open={showRoomFormDialog}
            onOpenChange={setShowRoomFormDialog}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="text-md flex items-center gap-6 font-normal"
              >
                <MdAddCircle className="size-6" />
                {t('channels.actions.create')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('channels.prompts.createChannel')}</DialogTitle>
                <DialogDescription>
                  {t('channels.prompts.startConversation')}
                </DialogDescription>
              </DialogHeader>

              <CreateChannelForm
                submitButton={(props) => (
                  <DialogFooter>
                    <CreateChannelFormSubmitButton {...props} />
                  </DialogFooter>
                )}
                onSubmit={() => {
                  setShowNavDrawer(false);
                  setShowRoomFormDialog(false);
                  setIsNavSheetOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            className="text-md flex items-center gap-6 font-normal"
            onClick={() => {
              navigate(`${serverPath}${NavigationPaths.Settings}`);
              setIsNavSheetOpen(false);
            }}
          >
            <MdSettings className="size-6" />
            {t('navigation.labels.serverSettings')}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
