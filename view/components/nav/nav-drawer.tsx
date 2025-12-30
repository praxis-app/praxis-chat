import {
  CreateChannelForm,
  CreateChannelFormSubmitButton,
} from '@/components/channels/create-channel-form';
import { SwitchServersDialog } from '@/components/nav/switch-servers-dialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { useMeQuery } from '@/hooks/use-me-query';
import { useServerData } from '@/hooks/use-server-data';
import { useAppStore } from '@/store/app.store';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAddCircle, MdOutlineSettings, MdSettings } from 'react-icons/md';
import { TbSwitchHorizontal } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';

interface Props {
  trigger: ReactNode;
  disabled: boolean;
}

export const NavDrawer = ({ trigger, disabled }: Props) => {
  const { setIsNavSheetOpen } = useAppStore();
  const [showNavDrawer, setShowNavDrawer] = useState(false);
  const [showRoomFormDialog, setShowRoomFormDialog] = useState(false);
  const [showServerSwitchDialog, setShowServerSwitchDialog] = useState(false);

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { serverAbility, instanceAbility } = useAbility();
  const { serverPath } = useServerData();
  const { data: meData } = useMeQuery();

  return (
    <>
      <Drawer open={showNavDrawer} onOpenChange={setShowNavDrawer}>
        {disabled ? trigger : <DrawerTrigger asChild>{trigger}</DrawerTrigger>}

        <DrawerContent className="flex min-h-[calc(100%-68px)] flex-col items-start rounded-t-2xl border-0">
          <VisuallyHidden>
            <DrawerHeader>
              <DrawerTitle>{t('navigation.titles.navDrawer')}</DrawerTitle>
              <DrawerDescription>
                {t('navigation.descriptions.navDrawer')}
              </DrawerDescription>
            </DrawerHeader>
          </VisuallyHidden>

          <div className="flex flex-col items-start gap-4 p-5">
            {serverAbility.can('manage', 'Channel') && (
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
                    <DialogTitle>
                      {t('channels.prompts.createChannel')}
                    </DialogTitle>
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
            )}

            {instanceAbility.can('manage', 'InstanceConfig') && (
              <Button
                variant="ghost"
                className="text-md flex items-center gap-6 font-normal"
                onClick={() => {
                  navigate(NavigationPaths.Settings);
                  setIsNavSheetOpen(false);
                }}
              >
                <MdOutlineSettings className="size-6" />
                {t('navigation.labels.instanceSettings')}
              </Button>
            )}

            {serverAbility.can('manage', 'ServerConfig') && (
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
            )}

            {meData && meData.user.serversCount > 1 && (
              <Button
                variant="ghost"
                className="text-md flex items-center gap-6 font-normal"
                onClick={() => setShowServerSwitchDialog(true)}
              >
                <TbSwitchHorizontal className="size-6" />
                {t('navigation.labels.switchServers')}
              </Button>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <SwitchServersDialog
        open={showServerSwitchDialog}
        onOpenChange={setShowServerSwitchDialog}
        onSelect={() => setIsNavSheetOpen(false)}
      />
    </>
  );
};
